window.addEventListener('message', function (event) {
    if (event.source != window) {
        return;
    }

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const signature = CryptoJS.SHA1(`timestamp=${timestamp}XwagiiiDK5IipHgoEB7p3TmnMDI`);

    console.log(timestamp);

    const form = new FormData();
    form.set('file', event.data.imageUrl);
    form.set('api_key', '294944356487366');
    form.set('timestamp', timestamp.toString());
    form.set('signature', signature);
    console.log('Uploading', form);

    if (event.data.type && (event.data.type === 'ADD_TO_STORY')) {
        fetch('https://api.cloudinary.com/v1_1/internetofstories/image/upload', {
    		method: 'POST',
			body: form
		}).then(r => r.json()).then(response => {
            console.log(response.secure_url);

            var url = response.secure_url;
            var curr_link = document.location.href;
            var token
            chrome.storage.local.get("accessToken",function (obj){
            token = obj["accessToken"];
            const postParameters = {pic: url, domain: curr_link,token: token};
            console.log(postParameters);
            $.post("https://bennavetta.com/stories", postParameters, responseJSON => {
            });
            });
            
        })
    }
});