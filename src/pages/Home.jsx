import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import RockCard from "../components/RockCard"
import AddRock from "../components/AddRock"

export default function Home() {
  const [rocks, setRocks] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchRocks() {
    setLoading(true)

    const { data, error } = await supabase
      .from("rocks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setRocks(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRocks()
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      
      {/* HEADER */}
      <header className="sticky top-0 bg-[#f6f5f2]/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          
          <div>
            <h1 className="text-2xl font-bold">🪨 Журнал камней</h1>
            <p className="text-sm text-gray-500">
                Ваша личная геологическая коллекция
            </p>
          </div>

        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto p-4">

        {/* Add button/form */}
        <div className="mb-6">
          <AddRock onAdded={fetchRocks} />
        </div>

        {/* GRID */}
        {loading ? (
          <p className="text-gray-500">Загрузка камней...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rocks.map((rock) => (
              <RockCard key={rock.id} rock={rock} />
            ))}
          </div>
        )}

        {!loading && rocks.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Пока нет камней 🪨
          </div>
        )}

      </main>
    </div>
  )
}