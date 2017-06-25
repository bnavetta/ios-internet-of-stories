/**
 * Created by grant on 6/24/17.
 */

var successURL = 'www.facebook.com/connect/login_success.html';

// Clear tokens when loading plugin:
// chrome.storage.local.remove("accessToken",function (){
//     console.log("Token Cleared");
// });

function onFacebookLogin(){
    console.log(localStorage.getItem('accessToken'))
    chrome.tabs.query({}, function(tabs) { // get all tabs from every window
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf(successURL) !== -1) {
                var params = tabs[i].url.split('#')[1];

                var accessToken = params.split('&')[0];
                accessToken = accessToken.split('=')[1];

                chrome.storage.local.set({"accessToken":accessToken},function (){
                    console.log("Storage Succesful");
                });
                chrome.tabs.remove(tabs[i].id);
                console.log(accessToken);
            }
        }
    });
}


chrome.tabs.onUpdated.addListener(onFacebookLogin);
