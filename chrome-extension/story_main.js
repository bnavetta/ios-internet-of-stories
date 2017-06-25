const testStories = {"users": [{"name": "name1", 
								"profile_picture": "https://mealsonwheelserie.files.wordpress.com/2012/12/brown-logo1.png",
								"stories": ["https://www.brown.edu/sites/default/files/imagecache/front_billboard/sdd-billboard-01.jpg", "https://www.brown.edu/sites/default/files/imagecache/front_billboard/sdd-billboard-01.jpg"]},
								{"name": "name2",
								 "profile_picture": "https://www.brown.edu/sites/default/files/imagecache/front_billboard/sdd-billboard-01.jpg",
								 "stories": ["https://www.brown.edu/sites/default/files/imagecache/front_billboard/sdd-billboard-01.jpg", "https://www.brown.edu/sites/default/files/imagecache/front_billboard/sdd-billboard-01.jpg"]}]}
function populateStories(stories) {
	const bubbleListElement = $("ul#internet-stories");
	const storiesElement = $("#internet-stories-post-story");
    chrome.storage.local.get("accessToken",function(obj){
        var token = obj["accessToken"];
        console.log("fffffddfdfsdfadfs");
        $.get('https://bennavetta.com/profile-picture', {"token":token}, function(data){
            console.log("Hllelle");
            console.log(data);
            $("#self-icon").attr("src", data)
        })
    });

	$.each(stories,function(i, user) {
		console.log(user);
		const bubbleTemplate = `
		<li id="${i+1}" class="internet-stories-bubble internet-stories-item">
			<img src="${user.profilePicture}" class="internet-stories-user">
			<h4 class="internet-stories-user">${user.name}</h4>
		</li>
		`;

		const $bubbleTemplate = $(bubbleTemplate) 
		$bubbleTemplate.click(function() {
			viewStory(i+1);
		})
		bubbleListElement.append($bubbleTemplate);
		console.log(user);
		console.log(user.stories);
		const storyTemplate = `
		<div id="${i+1}">
			<div id="myCarousel" class="internet-stories-post-story carousel slide" data-ride="carousel">
				<div class="carousel-inner">
				${user.entries.map(post => `<div class="item"><img src="${post}" style="width: 100%"></div>`)}
				</div>
			</div>
		</div>
		`;
		const $storyTemplate = $(storyTemplate);
		console.log($storyTemplate.find(".item")[0])
		$($storyTemplate.find(".item")[0]).addClass("active");
		storiesElement.append($storyTemplate);
		$('.carousel').carousel({
		    interval: 3000
		})
	})

    
}

function getAndPopulateStories(token, domain) {
	console.log(token);
	console.log(domain);
	$.get("https://bennavetta.com/stories", {"token": token, "domain": domain}, function(data) {
		const stories = data.users;
		console.log("STORIES:" + stories);
		populateStories(stories);
	})
}

function viewStory(number) {
	$.each($("#internet-stories-post-story").children(), function(i,c) {
		$(c).hide();
		$("#internet-stories-post-story").hide();
	})
	if (number == 0) {
		$("#internet-stories-black-screen").fadeIn();
		$("#internet-stories-post-story").show();
		$("#internet-stories-post-create").show();

	} else if (number > 0) {
		$("#internet-stories-black-screen").fadeIn();
		$("#internet-stories-post-story").show();
		$("#internet-stories-post-story #" + number).show();
	}

}

$(document).ready(function() {

    var token;
    console.log("test");
    chrome.storage.local.get("accessToken",function (obj){
        token = obj["accessToken"];
        console.log("kekekeke" + token);
        if (token) {
            $.get(chrome.extension.getURL('story_main.html'), function (data) {
                // $(data).appendTo('body');
                const widget = $($.parseHTML(data));
                console.log(widget);
                widget.find("img").each(function (i, userImage) {
                    $(userImage).attr("src", chrome.extension.getURL('icon.png'))
                });

                widget.prependTo('body');
                $("html").css("padding-top", "120px");

                const postButton = $(".internet-stories-bubble.own");
                const postModal = $("#internet-stories-post-story");
                postModal.hide();
                $("#internet-stories-cancel").hide();
                $("#internet-stories-confirm").hide();

                $("#internet-stories-black-screen").hide();

                postButton.click(function () {
                    console.log("post button triggered");
                    viewStory(0);
                    const video = document.getElementById("is_video");
                    video.style.display = "initial";
                    // Get access to the camera!
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        // Not adding `{ audio: true }` since we only want video now
                        navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                            webcam_stream = stream
                            video.src = window.URL.createObjectURL(webcam_stream);
                            video.play();
                        });
                    }
                })

                $("#internet-stories-black-screen").click(function () {
                    // console.log("out button triggered");
                    $("#internet-stories-black-screen").fadeOut();
                    if (webcam_stream != undefined) {
                        var track = webcam_stream.getTracks()[0];  // if only one media track
                        track.stop();
                        track = null;
                        const video = document.getElementById("is_video");
                        video.style.display = "none";

                    }
                    viewStory(-1);

                })

                var webcam_stream;
                var imageUrl;

                $("#internet-stories-post-story-capture-button button").click(function () {
                    // get current photo and send to story
                    const canvas = document.getElementById("is_canvas");
                    const video = document.getElementById("is_video");
                    var context = canvas.getContext('2d');
                    canvas.style.display = "block";
                    context.drawImage(video, 0, 0, 360, 270);
                    imageUrl = canvas.toDataURL('image/png')
                    $("#internet-stories-cancel").show();
                    $("#internet-stories-confirm").show();
                    $("#internet-stories-post-story-capture-button button").hide();
                })

                $("#internet-stories-cancel").click(function () {
                    console.log("CANCEL!")
                    const canvas = document.getElementById("is_canvas");
                    canvas.style.display = "none";
                    $("#internet-stories-cancel").hide();
                    $("#internet-stories-confirm").hide();
                    $("#internet-stories-post-story-capture-button button").show();
                })

                $("#internet-stories-confirm").click(function () {
                    console.log("CONFIRM!");
                    window.postMessage({type: 'ADD_TO_STORY', imageUrl: imageUrl}, '*');
                    imageUrl = null;
                    $("#internet-stories-cancel").hide();
                    $("#internet-stories-confirm").hide();
                    $("#internet-stories-post-story-capture-button button").show();
                })

                const postCapture = $(".internet-stories-post-story-button");
                let token;
                chrome.storage.local.get("accessToken", function (obj) {
                    token = obj["accessToken"];
                    console.log(token)
                    let url = window.location.href;
                    console.log("TOKEN!:" + token)
                    if (url != undefined && token != undefined) {
                        getAndPopulateStories(token, url);
                        
                    }
                })


            });

        }
    })
		
})
