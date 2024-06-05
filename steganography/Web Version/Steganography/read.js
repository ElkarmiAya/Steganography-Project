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

document.getElementById('read-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];

    if (!imageFile) {
        alert('Please select an image.');
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
            const beginningSequence = '10000000';
            const endingSequence = '11111110';
            let binaryText = '';

            for (let i = 0; i < pixels.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    binaryText += (pixels[i + j] & 1);
                }
            }

            if (binaryText.substring(0, 8) !== beginningSequence) {
                alert('No hidden text found in this image.');
                return;
            }

            let endIndex = binaryText.indexOf(endingSequence);
            if (endIndex === -1) {
                alert('No ending sequence found in this image.');
                return;
            }

            let hiddenBinaryText = binaryText.substring(8, endIndex);
            let hiddenText = '';

            for (let i = 0; i < hiddenBinaryText.length; i += 8) {
                let byte = hiddenBinaryText.substring(i, i + 8);
                hiddenText += String.fromCharCode(parseInt(byte, 2));
            }

            document.getElementById('hidden-text').innerText = hiddenText;
            document.getElementById('result').classList.remove('hidden');
        };
        image.src = imageUrl;
    };
    reader.readAsDataURL(imageFile);
});

