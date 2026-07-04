import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function RockCard({ rock, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/rock/${rock.id}`)}
      className="relative group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Delete button */}
      <button
        onClick={async (e) => {
          e.stopPropagation();

          if (!confirm("Delete this rock?")) return;

          onDelete?.(rock);
        }}
        className="
            absolute top-2 right-2 z-10
            bg-white/90 p-2 rounded-full shadow
            opacity-100 md:opacity-0 md:group-hover:opacity-100
        "
      >
        <Trash2 size={16} />
      </button>

      {/* Image */}
      <div className="h-48 overflow-hidden">
        <img
          src={rock.image_url}
          alt={rock.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {rock.name || "Unknown Rock"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {rock.type || "Unclassified"}
        </p>

        {rock.notes && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
            {rock.notes}
          </p>
        )}
      </div>
    </div>
  );
}
