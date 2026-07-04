import { supabase } from "../supabase"

function getFileNameFromUrl(url) {
  return url.split("/").pop()
}

export async function deleteRock(rock) {
  // Delete image first
  if (rock.image_url) {
    const fileName = getFileNameFromUrl(rock.image_url)
    console.log("Deleting file:", fileName) // Add this to debug

    const { error: storageError } = await supabase.storage
      .from("rock-images")
      .remove([fileName])
    
    if (storageError) {
      console.error("Failed to delete image:", storageError)
      throw storageError // Stop execution if image deletion fails
    }
  }
  
  // Then delete DB row
  const { error: dbError } = await supabase
    .from("rocks")
    .delete()
    .eq("id", rock.id)

  if (dbError) throw dbError
}