document.getElementById('image').addEventListener('change', function(event) {
    const imageInput = event.target;
    const imageFile = imageInput.files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageUrl = event.target.result;
            const chosenImage = document.getElementById('chosen-image');
            chosenImage.src = imageUrl;
            chosenImage.classList.remove('hidden');
        };
        reader.readAsDataURL(imageFile);
    }
});

document.getElementById('hide-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('image');
    const textToHide = document.getElementById('text-to-hide').value;
    const imageFile = imageInput.files[0];

    if (!imageFile) {
        alert('Please select an image.');
        return;
    }

    if (!textToHide) {
        alert('Please enter text to hide.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageUrl = event.target.result;
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const binaryText = textToHide.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join('');

            const beginningSequence = '10000000';
            const endingSequence = '11111110';
            const fullBinaryText = beginningSequence + binaryText + endingSequence;

            // Check if the image is large enough to hold the binary text
            const requiredBits = fullBinaryText.length;
            const availableBits = (pixels.length / 4) * 3;

            if (requiredBits > availableBits) {
                alert('The selected image is not large enough to hide the text.');
                return;
            }

            let binaryIndex = 0;
            for (let i = 0; i < pixels.length && binaryIndex < fullBinaryText.length; i += 4) {
                for (let j = 0; j < 3 && binaryIndex < fullBinaryText.length; j++) {
                    pixels[i + j] = (pixels[i + j] & 254) | parseInt(fullBinaryText[binaryIndex]);
                    binaryIndex++;
                }
            }

            context.putImageData(imageData, 0, 0);
            const encodedImageUrl = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.href = encodedImageUrl;
            downloadLink.download = 'encoded_image.png';
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        image.src = imageUrl;
    };
    reader.readAsDataURL(imageFile);
});
