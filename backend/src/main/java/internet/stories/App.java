package internet.stories;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import facebook4j.*;
import facebook4j.auth.AccessToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.google.common.base.Preconditions.checkNotNull;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;

public class App
{
    private static final Logger log = LoggerFactory.getLogger(App.class);

    public static final String APP_ID = "240176929815663";
    public static final String APP_SECRET = "707da33ce7b378289bc203725233c912";

    public static void main(String[] args)
    {
        String envPort = System.getenv("PORT");
        if (envPort != null) {
            port(Integer.parseInt(envPort));
        }

        Gson gson = new Gson();

        AmazonDynamoDB dynamo = AmazonDynamoDBClientBuilder.standard()
//                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("http://localhost:8000", "us-west-2"))
                .withRegion(Regions.US_EAST_1)
                .build();

        StoryRepository stories = new StoryRepository(new DynamoDB(dynamo));
        stories.initialize();

        get("/stories", (req, res) -> {
            String token = checkNotNull(req.queryParams("token"), "Token missing");
            String domain = checkNotNull(
                    URI.create(checkNotNull(req.queryParams("domain"), "Site URL missing")).getHost()
            );

            Facebook facebook = new FacebookFactory().getInstance();
            facebook.setOAuthAppId(APP_ID, APP_SECRET);
            facebook.setOAuthPermissions("user_profile,user_friends,user_picture");
            facebook.setOAuthAccessToken(new AccessToken(token, null));

            List<Friend> friends = Helpers.allPages(facebook, facebook.friends().getFriends());
            List<String> friendIds = friends.stream().map(f -> f.getId()).collect(Collectors.toList());
            List<Story> results = stories.getStories(domain, friendIds, (userId, entries) -> {
                User user = Helpers.getUser(facebook, userId);

                String name = "Unknown";
                String profileUrl = "";
                if (user != null) {
                    name = user.getName();
                    profileUrl = "https://graph.facebook.com/" + userId + "/picture?type=normal";
//                    profileUrl = user.getPicture().getURL().toExternalForm();
                }

                return new Story(name, profileUrl, entries);
            });

            log.info("Fetched stories: {}", results);

            res.header("Content-Type", "application/json");

            Map<String, Object> variables = ImmutableMap.of("users", results);
            return variables;
        }, gson::toJson);

        get("/profile-picture", (req, res) -> {
            String token = checkNotNull(req.queryParams("token"), "Token missing");

            Facebook facebook = new FacebookFactory().getInstance();
            facebook.setOAuthAppId(APP_ID, APP_SECRET);
            facebook.setOAuthPermissions("user_profile");
            facebook.setOAuthAccessToken(new AccessToken(token, null));

            return "https://graph.facebook.com/" + facebook.getMe().getId() + "/picture?type=normal";
        });

        // /stories?pic&domain&token
        post("/stories", (req, res) -> {
            String token = checkNotNull(req.queryParams("token"), "Token missing");
            String domain = URI.create(checkNotNull(req.queryParams("domain"), "Site URL missing")).getHost();
            String image = checkNotNull(req.queryParams("pic"), "Picture URL missing");

            Facebook facebook = new FacebookFactory().getInstance();
            facebook.setOAuthAppId(APP_ID, APP_SECRET);
            facebook.setOAuthPermissions("user_profile");
            facebook.setOAuthAccessToken(new AccessToken(token, null));

            User me = facebook.getMe();
            log.debug("Adding {} to {}'s story on {}", image, me.getName(), domain);

            stories.addToStory(domain, me.getId(), image);

            res.header("Content-Type", "application/json");
            return "{\"success\": true}";
        });

        get("/hello", (req, res) -> {
            Facebook facebook = new FacebookFactory().getInstance();
            facebook.setOAuthAppId(APP_ID, APP_SECRET);
            facebook.setOAuthPermissions("user_friends");
            facebook.setOAuthAccessToken(new AccessToken(req.queryParams("access_token"), null));
            List<Friend> friends = Helpers.allPages(facebook, facebook.friends().getFriends());

            return friends.stream().map(f -> f.getName()).collect(Collectors.joining("\n"));
        });
    }
}
