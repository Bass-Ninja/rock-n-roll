import { useRef, useState } from "react";
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

export default function AddRock({ onAdded }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [minerals, setMinerals] = useState([]);
  const [notes, setNotes] = useState("");
  const [hardness, setHardness] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mineralSearch, setMineralSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapLocation, setMapLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState("");
  const [showMineralList, setShowMineralList] = useState(false);

  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

      streamRef.current = stream;
    } catch (err) {
      console.error(err);
      alert("Камера недоступна. Проверьте разрешения.");
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "rock.jpg", { type: "image/jpeg" });
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }, "image/jpeg");

    stopCamera();
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOpen(false);
  }

  function getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => reject(err),
      );
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let lat = null;
    let lng = null;

    try {
      const location = await getLocation();
      lat = location.lat;
      lng = location.lng;
    } catch (err) {
      console.log("Location denied or unavailable", err);
    }

    try {
      let imageUrl = "";

      if (file) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
          .from("rock-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from("rock-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("rocks").insert([
        {
          name,
          type: type || "Неизвестный",
          hardness: hardness || null,
          minerals,
          notes,
          image_url: imageUrl,
          location: location || null,
          latitude: mapLocation?.lat || null,
          longitude: mapLocation?.lng || null,
        },
      ]);

      if (insertError) throw insertError;

      setName("");
      setType("");
      setMinerals([]);
      setNotes("");
      setFile(null);
      setPreview(null);

      onAdded?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении камня");
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-stone-900 text-white py-4 font-medium shadow"
      >
        + Добавить камень
      </button>
    );
  }

  if (cameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-4 flex gap-3">
          <button
            onClick={takePhoto}
            className="flex-1 bg-white text-black rounded-xl py-3"
          >
            Сделать фото
          </button>
          <button
            onClick={stopCamera}
            className="flex-1 bg-red-500 text-white rounded-xl py-3"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold">🪨 Добавить камень</h2>

      <input
        placeholder="Имя"
        className="w-full rounded-2xl border border-stone-200 px-4 py-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3"
      >
        <option value="">Не выбрано</option>
        {ROCK_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={hardness}
        onChange={(e) => setHardness(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3"
      >
        <option value="">Твёрдость по Моосу (не указана)</option>
        {MOHS_SCALE.map((h) => (
          <option key={h.value} value={h.value}>
            {h.label}
          </option>
        ))}
      </select>

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
            {minerals.slice(0, 5).map((mineral, idx) => {
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
            {minerals.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{minerals.length - 5} ещё
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
                <p className="text-sm text-gray-400 p-4">Ничего не найдено</p>
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

        {/* Show count when collapsed */}
        {!showMineralList && minerals.length > 0 && (
          <p className="text-xs text-gray-500">
            Выбрано минералов: {minerals.length}
          </p>
        )}
      </div>

      <textarea
        placeholder="Заметки"
        className="w-full p-3 rounded-xl bg-gray-100"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="space-y-3">
        <input
          placeholder="📍 Название места (например: Парк у реки)"
          className="w-full rounded-2xl border border-stone-200 px-4 py-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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

      <button
        type="button"
        onClick={startCamera}
        className="w-full bg-stone-800 text-white rounded-2xl py-3"
      >
        📷 Сфотографировать камень
      </button>

      {preview && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Предпросмотр:</p>
          <img src={preview} className="w-full h-48 object-cover rounded-2xl" />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-stone-900 text-white rounded-2xl py-3"
        >
          {loading ? "Загрузка..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-6 rounded-2xl border"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
