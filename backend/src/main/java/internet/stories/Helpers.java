package internet.stories;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import facebook4j.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class Helpers {
    private static final Logger log = LoggerFactory.getLogger(Helpers.class);

    private static final Cache<String, User> userCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(10000)
            .build();

    public static <T> List<T> allPages(Facebook facebook, ResponseList<T> list) throws FacebookException {
        List<T> results = new ArrayList<>();
        ResponseList<T> current = list;
        while (true)
        {
            results.addAll(current);
            current.getPaging().getCursors().getAfter();
            current = facebook.fetchNext(current.getPaging());
            if (current == null) break;
        }

        return results;
    }

    public static User getUser(Facebook facebook, String userId) {
        return userCache.get(userId, id -> {
            try
            {
                return facebook.getUser(id, new Reading().fields("name", "picture").addParameter("type", "small"));
            }
            catch (FacebookException e)
            {
                log.error("Error fetching user info", e);
                return null;
            }
        });
    }
}
