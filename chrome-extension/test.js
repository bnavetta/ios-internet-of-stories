/**
 * Created by grant on 6/24/17.
 */

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('link');
    // onClick's logic below:
    link.addEventListener('click', function() {
        console.log(localStorage.getItem('accessToken'));
        console.log(localStorage.getItem('userData'));
        console.log(localStorage.getItem('userData').id);
    });
});