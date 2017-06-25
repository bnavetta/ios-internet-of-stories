package internet.stories;

import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.*;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class StoryRepository
{
    private static final Logger log = LoggerFactory.getLogger(StoryRepository.class);

    private static final String TABLE_NAME = "internet-stories";

    private final DynamoDB dynamoDB;
    private final Table table;

    public StoryRepository(DynamoDB dynamoDB) {
        this.dynamoDB = dynamoDB;
        this.table = dynamoDB.getTable(TABLE_NAME);
    }

    public void initialize()
    {
        TableCollection<ListTablesResult> tables = dynamoDB.listTables();
        for (Table table : tables)
        {
            if (table.getTableName().equals(TABLE_NAME)) return;
        }

        dynamoDB.createTable(TABLE_NAME,
                Arrays.asList(
                        new KeySchemaElement("website", KeyType.HASH),
                        new KeySchemaElement("user", KeyType.RANGE)
                ),
                Arrays.asList(
                        new AttributeDefinition("website", ScalarAttributeType.S),
                        new AttributeDefinition("user", ScalarAttributeType.S)
                ),
                new ProvisionedThroughput(5L, 5L)
        );
    }

    public void addToStory(String website, String userId, String imageUrl)
    {
        log.debug("Adding story entry for {} on {}: {}", userId, website, imageUrl);
        UpdateItemSpec update = new UpdateItemSpec()
                .withPrimaryKey("website", website, "user", userId)
                .withUpdateExpression("set entries = list_append(if_not_exists(entries, :empty), :image)")
                .withValueMap(new ValueMap()
                        .withList(":image", Lists.newArrayList(imageUrl))
                        .withList(":empty", Lists.newArrayList()))
                .withReturnValues(ReturnValue.UPDATED_NEW);
        UpdateItemOutcome outcome = table.updateItem(update);
        if (log.isDebugEnabled()) {
            log.debug("Updated story: {}", outcome.getItem().toJSONPretty());
        }
    }

    public List<Story> getStories(String website, List<String> friendIds, BiFunction<String, List<String>, Story> hydrator)
    {
        QuerySpec querySpec = new QuerySpec()
                .withKeyConditionExpression("website = :site")
                .withValueMap(new ValueMap().withString(":site", website));
        ItemCollection<QueryOutcome> items = table.query(querySpec);

        return StreamSupport.stream(items.spliterator(), false)
                .peek(item -> log.debug("Loaded story: {}", item))
                .filter(i -> friendIds.contains(i.getString("user")))
                .map(i -> {
                    String userId = i.getString("user");
                    List<String> entries = i.getList("entries");
                    log.debug("Hydrating story for {} on {}", userId, website);
                    return hydrator.apply(userId, entries);
                })
                .collect(Collectors.toList());
    }
}
