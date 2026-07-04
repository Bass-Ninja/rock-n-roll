import { useRef, useState } from "react"
import { supabase } from "../lib/supabase"
import { ROCK_TYPES } from "../constants/rockTypes"

export default function AddRock({ onAdded }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const [open, setOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // 📷 Start camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })

      videoRef.current.srcObject = stream
      streamRef.current = stream
      videoRef.current?.play()

      setCameraOpen(true)
    } catch (err) {
      console.error(err)
      alert("Не удалось открыть камеру")
    }
  }

  // 📸 Take photo
  function takePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      const file = new File([blob], "rock.jpg", { type: "image/jpeg" })

      setFile(file)
      setPreview(URL.createObjectURL(file))
    }, "image/jpeg")

    stopCamera()
  }

  // ❌ Stop camera
  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCameraOpen(false)
  }

  function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      (err) => reject(err)
    )
  })
}

  // 💾 Save rock
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    let lat = null
    let lng = null

    try {
        const location = await getLocation()
        lat = location.lat
        lng = location.lng
    } catch (err) {
        console.log("Location denied or unavailable", err)
    }

    try {
      let imageUrl = ""

      // 1. Upload image
      if (file) {
        const fileName = `${Date.now()}-${file.name}`

        const { error } = await supabase.storage
          .from("rock-images")
          .upload(fileName, file)

        if (error) throw error

        const { data } = supabase.storage
          .from("rock-images")
          .getPublicUrl(fileName)

        imageUrl = data.publicUrl
      }

      const { error: insertError } = await supabase
        .from("rocks")
        .insert([
            {
            name,
            type,
            notes,
            image_url: imageUrl,
            latitude: lat,
            longitude: lng
            }
        ])

      if (insertError) throw insertError

      // 3. Reset
      setName("")
      setType("")
      setNotes("")
      setFile(null)
      setPreview(null)

      onAdded?.()
      setOpen(false)

    } catch (err) {
      console.error(err)
      alert("Ошибка при добавлении камня")
    }

    setLoading(false)
  }

  // 🧭 CLOSED STATE (button only)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-stone-900 text-white py-4 font-medium shadow"
      >
        + Добавить камень
      </button>
    )
  }

  // 📷 CAMERA MODE
  if (cameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">

        <video
          ref={videoRef}
          autoPlay
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
    )
  }

  // 🧾 FORM MODE
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold">🪨 Добавить камень</h2>

      {/* Name */}
      <input
        placeholder="Имя"
        className="w-full rounded-2xl border border-stone-200 px-4 py-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Type enum */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3"
      >
        {ROCK_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Notes */}
      <textarea
        placeholder="Заметки"
        className="w-full p-3 rounded-xl bg-gray-100"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* File upload */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => {
          const f = e.target.files[0]
          setFile(f)

          if (f) {
            setPreview(URL.createObjectURL(f))
          }
        }}
      />

      {/* Camera button */}
      <button
        type="button"
        onClick={startCamera}
        className="w-full bg-stone-800 text-white rounded-2xl py-3"
      >
        📷 Сфотографировать камень
      </button>

      {/* Preview */}
      {preview && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Предпросмотр:</p>
          <img
            src={preview}
            className="w-full h-48 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Actions */}
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
  )
}