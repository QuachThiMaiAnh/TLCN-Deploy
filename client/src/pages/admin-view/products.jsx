import { useState, useRef } from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

function ProductImageUpload() {
  const [imageFiles, setImageFiles] = useState(null); // Store FileList directly
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setImageFiles(selectedFiles); // Store FileList directly in state
    }
  }

  function handleRemoveImage(index) {
    const fileArray = Array.from(imageFiles);
    fileArray.splice(index, 1);
    setImageFiles(fileArray.length ? new DataTransfer().files : null);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Label className="text-lg font-semibold mb-2 block">
        Tải hình ảnh lên
      </Label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = e.dataTransfer.files;
          setImageFiles(droppedFiles);
        }}
        className="border-2 border-dashed rounded-lg p-4"
      >
        <Input
          id="image-upload"
          multiple
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />
        <Label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center h-32 cursor-pointer"
        >
          <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
          <span>Kéo, thả hoặc click để tải ảnh</span>
        </Label>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {imageFiles &&
          Array.from(imageFiles).map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="Uploaded thumbnail"
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveImage(index)}
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Remove File</span>
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ProductImageUpload;
