const script = document.createElement('script');
script.src = chrome.extension.getURL('webcam.js');
document.body.appendChild(script)

const css = document.createElement('link');
css.href = chrome.extension.getURL('main.css');
css.rel = "stylesheet"
document.body.appendChild(css)

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

            const postParameters = {pic: url, domain: curr_link,token:'EAACEdEose0cBAEV8ANuj95Mleu99bV0ZBtKzUaj2tbTHGimF9QBA4b4to4KkoVNJHtTzU1SL7yV0ZAerbDzQYZADB7FxUXQsKQYYm72fB72nMyjiwCkOqTy7dw21jTmQGdzzcCEcszIaC9MoLQZCFMGoL8GcmFXZCgMkiukudrAUHOkoSaPLsr4eDqfmzeXbwED97Wab2XwZDZD'};
            console.log(postParameters);
            $.post("/stories", postParameters, responseJSON => {
            const responseObject = JSON.parse(responseJSON);
            console.log(responseObject);
		    });
        })
    }
});
