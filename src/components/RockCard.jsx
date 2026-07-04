import { useNavigate } from "react-router-dom"

export default function RockCard({ rock }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/rock/${rock.id}`)}
      className="
        cursor-pointer
        group
        bg-white
        rounded-3xl
        overflow-hidden
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      <div className="h-48 overflow-hidden">
        <img
          src={rock.image_url}
          alt={rock.name}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />
      </div>

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
  )
}