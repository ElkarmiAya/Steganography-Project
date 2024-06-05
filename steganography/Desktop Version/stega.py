import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import os

def text_to_binary(text):
    return ''.join(format(ord(char), '08b') for char in text)

def encode_image(image_path, text, output_path):
    image = Image.open(image_path)
    binary_text = text_to_binary(text) + '1111111111111110'
    binary_text_index = 0

    pixels = list(image.getdata())
    mode = image.mode

    new_pixels = []
    for pixel in pixels:
        new_pixel = []
        for color in pixel[:3]:
            if binary_text_index < len(binary_text):
                new_color = (color & 0xFE) | int(binary_text[binary_text_index])
                binary_text_index += 1
            else:
                new_color = color
            new_pixel.append(new_color)

        if mode == 'RGBA' and len(pixel) == 4:
            new_pixel.append(pixel[3])

        new_pixels.append(tuple(new_pixel))

    new_image = Image.new(image.mode, image.size)
    new_image.putdata(new_pixels)
    new_image.save(output_path)

def decode_image(image_path):
    image = Image.open(image_path)
    pixels = list(image.getdata())

    binary_text = ''
    for pixel in pixels:
        for color in pixel[:3]:
            binary_text += str(color & 1)

    end_index = binary_text.find('1111111111111110')
    if end_index != -1:
        binary_text = binary_text[:end_index]

    text = ''.join(chr(int(binary_text[i:i+8], 2)) for i in range(0, len(binary_text), 8))
    return text

class SteganographyApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Steganography App")
        self.root.geometry("600x400")

        self.label = tk.Label(root, text="Steganography App", font=("CMTI12", 40))
        self.label.pack(pady=10)

        self.upload_btn = tk.Button(root, text="Upload Image", command=self.upload_image)
        self.upload_btn.pack(pady=5)

        self.image_label = tk.Label(root)
        self.image_label.pack(pady=5)

        self.text_entry = tk.Entry(root, width=50)
        self.text_entry.pack(pady=5)

        self.hide_text_btn = tk.Button(root, text="Hide Text in Image", command=self.hide_text)
        self.hide_text_btn.pack(pady=5)

        self.read_text_btn = tk.Button(root, text="Read Text from Image", command=self.read_text)
        self.read_text_btn.pack(pady=5)

        self.image_path = ""
        self.output_directory = os.path.join(os.path.expanduser("~"), "Desktop", "steganographie")
        if not os.path.exists(self.output_directory):
            os.makedirs(self.output_directory)

    def upload_image(self):
        self.image_path = filedialog.askopenfilename()
        if self.image_path:
            image = Image.open(self.image_path)
            image.thumbnail((400, 400))
            img = ImageTk.PhotoImage(image)
            self.image_label.config(image=img)
            self.image_label.image = img

    def hide_text(self):
        text = self.text_entry.get()
        if self.image_path and text:
            output_path = os.path.join(self.output_directory, "output_image.png")
            try:
                encode_image(self.image_path, text, output_path)
                messagebox.showinfo("Success", f"Text hidden in image and saved to {output_path} successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"An error occurred: {e}")
        else:
            messagebox.showwarning("Input Error", "Please upload an image and enter some text.")

    def read_text(self):
        if self.image_path:
            try:
                decoded_text = decode_image(self.image_path)
                messagebox.showinfo("Hidden Text", f"The hidden text is: {decoded_text}")
            except Exception as e:
                messagebox.showerror("Error", f"An error occurred: {e}")
        else:
            messagebox.showwarning("Input Error", "Please upload an image.")

if __name__ == "__main__":
    root = tk.Tk()
    app = SteganographyApp(root)
    root.mainloop()



