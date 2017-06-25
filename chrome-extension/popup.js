/**
 * Created by grant on 6/24/17.
 */
window.fbAsyncInit = function() {
    FB.init({
        appId            : 240176929815663,
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.9'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));