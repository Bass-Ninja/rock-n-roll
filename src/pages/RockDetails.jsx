import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function RockDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rock, setRock] = useState(null)

  useEffect(() => {
    async function fetchRock() {
      const { data } = await supabase
        .from("rocks")
        .select("*")
        .eq("id", id)
        .single()

      setRock(data)
    }

    fetchRock()
  }, [id])

  if (!rock) {
    return <div className="p-6">Загрузка...</div>
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
        
        <img
          src={rock.image_url}
          className="w-full h-72 object-cover"
        />

        <div className="p-6">
          <h1 className="text-2xl font-bold">
            {rock.name || "Неизвестный камень"}
          </h1>

          <p className="text-gray-500 mt-2">
            Тип: {rock.type}
          </p>

          <p className="mt-4 text-gray-700">
            {rock.notes || "Нет заметок"}
          </p>
        </div>

      </div>
    </div>
  )
}