package internet.stories;

import com.google.common.base.MoreObjects;

import java.util.List;

public class Story
{
    private final String name;
    private final String profilePicture;
    private final List<String> entries;

    public Story(String name, String profilePicture, List<String> entries) {
        this.name = name;
        this.profilePicture = profilePicture;
        this.entries = entries;
    }

    public String getName() {
        return name;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public List<String> getEntries() {
        return entries;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("name", name)
                .add("profilePicture", profilePicture)
                .add("entries", entries)
                .toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Story story = (Story) o;

        if (name != null ? !name.equals(story.name) : story.name != null) return false;
        if (profilePicture != null ? !profilePicture.equals(story.profilePicture) : story.profilePicture != null)
            return false;
        return entries != null ? entries.equals(story.entries) : story.entries == null;
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (profilePicture != null ? profilePicture.hashCode() : 0);
        result = 31 * result + (entries != null ? entries.hashCode() : 0);
        return result;
    }
}
