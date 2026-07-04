import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROCK_TYPES } from "../constants/rockTypes";
import { MOHS_SCALE } from "../constants/hardness";
import {
  UNIQUE_MINERALS,
  MINERAL_CATEGORIES,
  CATEGORY_COLORS,
  getMineralCategory,
} from "../constants/minerals";
import LocationPicker from "../components/LocationPicker";

export default function RockDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rock, setRock] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [hardness, setHardness] = useState("");
  const [minerals, setMinerals] = useState([]);
  const [notes, setNotes] = useState("");
  const [mineralSearch, setMineralSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [showMineralList, setShowMineralList] = useState(false);

  // Map state
  const [mapLocation, setMapLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function fetchRock() {
      const { data } = await supabase
        .from("rocks")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setRock(data);
        setName(data.name || "");
        setType(data.type || "");
        setHardness(data.hardness || "");
        setMinerals(data.minerals || []);
        setNotes(data.notes || "");
        setLocation(data.location || "");

        // Load existing coordinates
        if (data.latitude && data.longitude) {
          setMapLocation({ lat: data.latitude, lng: data.longitude });
        }
      }
    }

    fetchRock();
  }, [id]);

  const filteredMinerals = UNIQUE_MINERALS.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(mineralSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function toggleMineral(mineral) {
    setMinerals((prev) =>
      prev.includes(mineral)
        ? prev.filter((m) => m !== mineral)
        : [...prev, mineral],
    );
  }

  async function updateRock(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("rocks")
      .update({
        name,
        type: type || "Неизвестный",
        hardness: hardness || null,
        minerals,
        notes,
        location: location || null,
        latitude: mapLocation?.lat || null,
        longitude: mapLocation?.lng || null,
      })
      .eq("id", id);

    if (error) {
      alert("Update failed");
      return;
    }

    setRock({
      ...rock,
      name,
      type,
      hardness,
      minerals,
      notes,
      location,
      latitude: mapLocation?.lat || null,
      longitude: mapLocation?.lng || null,
    });
    setIsEditing(false);
    setShowMap(false);
    setShowMineralList(false);
  }

  function cancelEdit() {
    setName(rock.name || "");
    setType(rock.type || "");
    setHardness(rock.hardness || "");
    setMinerals(rock.minerals || []);
    setNotes(rock.notes || "");
    setLocation(rock.location || "");

    // Reset map to original coordinates
    if (rock.latitude && rock.longitude) {
      setMapLocation({ lat: rock.latitude, lng: rock.longitude });
    } else {
      setMapLocation(null);
    }
    setIsEditing(false);
    setShowMap(false);
    setShowMineralList(false);
  }

  if (!rock) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-500"
      >
        ← Назад
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow">
        <img src={rock.image_url} className="w-full h-72 object-cover" />

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={updateRock} className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-3 rounded-xl"
                placeholder="Название"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Неизвестный</option>
                {ROCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={hardness}
                onChange={(e) => setHardness(e.target.value)}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Твёрдость по Моосу (не указана)</option>
                {MOHS_SCALE.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>

              {/* Location section with map */}
              <div className="space-y-3">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border p-3 rounded-xl"
                  placeholder="📍 Где нашли?"
                />

                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full bg-stone-100 text-stone-700 rounded-2xl py-3 text-sm"
                >
                  🗺️ {showMap ? "Скрыть карту" : "Или выбрать на карте"}
                </button>

                {showMap && (
                  <div>
                    <LocationPicker
                      onLocationSelect={(loc) => setMapLocation(loc)}
                      initialPosition={
                        mapLocation ? [mapLocation.lat, mapLocation.lng] : null
                      }
                    />
                    {mapLocation && (
                      <p className="text-sm text-gray-500 mt-2">
                        Координаты: {mapLocation.lat.toFixed(4)},{" "}
                        {mapLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Minerals section - COLLAPSIBLE WITH PREVIEW */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Минералы в составе:</p>
                  <button
                    type="button"
                    onClick={() => setShowMineralList(!showMineralList)}
                    className="text-xs text-stone-600 hover:text-stone-900 underline"
                  >
                    {showMineralList ? "Скрыть" : "Выбрать"}{" "}
                    {minerals.length > 0 && `(${minerals.length})`}
                  </button>
                </div>

                {/* Show preview when collapsed */}
                {!showMineralList && minerals.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {minerals.slice(0, 10).map((mineral, idx) => {
                      const category = getMineralCategory(mineral);
                      const colors = CATEGORY_COLORS[category];
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}
                        >
                          {mineral}
                        </span>
                      );
                    })}
                    {minerals.length > 10 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500">
                        +{minerals.length - 10} ещё
                      </span>
                    )}
                  </div>
                )}

                {/* Full list when expanded */}
                {showMineralList && (
                  <>
                    <input
                      type="text"
                      placeholder="🔍 Поиск минерала..."
                      value={mineralSearch}
                      onChange={(e) => setMineralSearch(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2 mb-3"
                    />

                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-1 rounded-full text-xs border transition ${
                          selectedCategory === "all"
                            ? "bg-stone-900 text-white border-stone-900"
                            : "bg-white text-stone-700 border-stone-300"
                        }`}
                      >
                        Все
                      </button>
                      {Object.keys(MINERAL_CATEGORIES).map((category) => {
                        const colors = CATEGORY_COLORS[category];
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-xs border transition ${
                              selectedCategory === category
                                ? `${colors.selectedBg} ${colors.selectedText} border-transparent`
                                : `${colors.bg} ${colors.text} ${colors.border}`
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border rounded-2xl mb-3">
                      {filteredMinerals.length === 0 ? (
                        <p className="text-sm text-gray-400 p-4">
                          Ничего не найдено
                        </p>
                      ) : (
                        filteredMinerals.map((mineral) => {
                          const isSelected = minerals.includes(mineral.name);
                          const colors = CATEGORY_COLORS[mineral.category];
                          return (
                            <button
                              key={mineral.name}
                              type="button"
                              onClick={() => toggleMineral(mineral.name)}
                              className={`px-3 py-1 rounded-full text-sm border transition ${
                                isSelected
                                  ? `${colors.selectedBg} ${colors.selectedText} border-transparent`
                                  : `${colors.bg} ${colors.text} ${colors.border}`
                              }`}
                              title={mineral.category}
                            >
                              {mineral.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border p-3 rounded-xl"
                placeholder="Заметки"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded-xl"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                {rock.name || "Неизвестный камень"}
              </h1>

              <p className="text-gray-500 mt-2">
                Тип: {rock.type || "Неизвестный"}
              </p>

              {rock.hardness && (
                <p className="text-gray-500 mt-1">
                  Твёрдость по Моосу: {rock.hardness}
                </p>
              )}

              {rock.location && (
                <p className="text-gray-500 mt-1">📍 {rock.location}</p>
              )}

              {/* Map preview in view mode */}
              {rock.latitude && rock.longitude && (
                <div className="mt-3">
                  <p className="text-gray-500 text-sm mb-2">
                    🗺️ Местоположение:
                  </p>
                  <div className="rounded-2xl overflow-hidden border">
                    <LocationPicker
                      onLocationSelect={() => {}}
                      initialPosition={[rock.latitude, rock.longitude]}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {rock.latitude.toFixed(4)}, {rock.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              {rock.minerals && rock.minerals.length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-500 text-sm">Минералы:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rock.minerals.map((mineral, idx) => {
                      const category = getMineralCategory(mineral);
                      const colors = CATEGORY_COLORS[category];
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text} border ${colors.border}`}
                          title={category}
                        >
                          {mineral}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="mt-4 text-gray-700">
                {rock.notes || "Нет заметок"}
              </p>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-black text-white px-4 py-2 rounded-xl"
              >
                Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
