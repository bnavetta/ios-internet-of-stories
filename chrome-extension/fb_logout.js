/**
 * Created by grant on 6/25/17.
 */

chrome.storage.local.get("accessToken",function(obj){
    var token = obj["accessToken"];
    var y = document.getElementById('login-div');
    var x = document.getElementById('logout');
    if (token){
        // $("#login-div").html("<button id=\'logout\'>logout</button>")
        y.style.display = 'none';
    } else {
        x.style.display = 'none';
    }

});

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('logout');
    // onClick's logic below:
    link.addEventListener('click', function() {
        chrome.storage.local.remove("accessToken",function (){
            console.log("logged out");
            location.reload();
        });
    });
});