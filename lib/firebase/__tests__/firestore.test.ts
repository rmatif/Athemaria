// @ts-nocheck
// Mock Firebase Firestore functions
// These are simplified mocks. In a real setup, you'd use jest.fn() for more advanced spying and assertion.

// Mock configuration for db
const mockDb = {};

const mockAddDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockDeleteDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockTimestamp = {
  now: jest.fn(() => ({
    toMillis: jest.fn(() => Date.now().toString())
  }))
};


jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => mockDb),
  addDoc: (...args) => mockAddDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  doc: (...args) => mockDoc(...args),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  Timestamp: mockTimestamp,
}));

// Import the functions to be tested
import { getStory, createStory, updateStory, getStories } from "../firestore";
import { Chapter, Story, StoryInput, StoryUpdate } from "../../types";


describe("Firestore Story Functions", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAddDoc.mockReset();
    mockGetDoc.mockReset();
    mockGetDocs.mockReset();
    mockUpdateDoc.mockReset();
    mockDoc.mockReset();
    mockCollection.mockReset();
    mockQuery.mockReset();
  });

  // --- getStory Tests ---
  describe("getStory", () => {
    it("should return a story with chapters if they exist", async () => {
      const mockStoryData: Partial<Story> = {
        title: "Test Story with Chapters",
        chapters: [{ id: "chap1", title: "Chapter 1", content: "Content 1", order: 1 }],
        authorId: "author1",
        authorName: "Author Name",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        description: "A test description",
        genre: "Fiction",
        status: "published",
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: "story1",
        data: () => mockStoryData,
      });
      mockDoc.mockReturnValue({}); // mock doc reference

      const story = await getStory("story1");
      expect(story).toBeDefined();
      expect(story?.id).toBe("story1");
      expect(story?.title).toBe("Test Story with Chapters");
      expect(story?.chapters).toEqual(mockStoryData.chapters);
      expect(mockDoc).toHaveBeenCalledWith(mockDb, "stories", "story1");
    });

    it("should convert content to a single chapter if chapters do not exist but content does", async () => {
      const mockStoryData = {
        title: "Old Story",
        content: "Old content", // Old format
        authorId: "author2",
        authorName: "Author Two",
        createdAt: "2023-01-02",
        updatedAt: "2023-01-02",
        description: "An old story",
        genre: "History",
        status: "draft",
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: "story2",
        data: () => mockStoryData,
      });
      mockDoc.mockReturnValue({});

      const story = await getStory("story2");
      expect(story).toBeDefined();
      expect(story?.id).toBe("story2");
      expect(story?.chapters).toEqual([
        { id: "default", title: "Chapter 1", content: "Old content", order: 1 },
      ]);
      expect(story?.content).toBeUndefined(); // Ensure old content field is not present
    });

    it("should return chapters as an empty array if neither chapters nor content exist", async () => {
      const mockStoryData = {
        title: "Empty Story",
        // No chapters, no content
        authorId: "author3",
        authorName: "Author Three",
        createdAt: "2023-01-03",
        // ... other fields
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: "story3",
        data: () => mockStoryData,
      });
      mockDoc.mockReturnValue({});

      const story = await getStory("story3");
      expect(story).toBeDefined();
      expect(story?.id).toBe("story3");
      expect(story?.chapters).toEqual([]);
      expect(story?.content).toBeUndefined();
    });

    it("should return null if the story document does not exist", async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });
      mockDoc.mockReturnValue({});

      const story = await getStory("nonexistentstory");
      expect(story).toBeNull();
    });
  });

  // --- createStory Tests ---
  describe("createStory", () => {
    it("should call addDoc with correct story data and default empty chapters if not provided", async () => {
      const storyInput: StoryInput = {
        title: "New Story",
        chapters: [], // Explicitly empty as per new type, or could be defaulted in function
        description: "A new story",
        genre: "Sci-Fi",
        authorId: "author4",
        authorName: "Author Four",
        createdAt: new Date().toISOString(),
        status: "draft",
      };
      mockAddDoc.mockResolvedValue({ id: "newStoryId" });
      mockCollection.mockReturnValue({}); // mock collection reference

      const newStoryId = await createStory(storyInput);

      expect(newStoryId).toBe("newStoryId");
      expect(mockCollection).toHaveBeenCalledWith(mockDb, "stories");
      expect(mockAddDoc).toHaveBeenCalledWith({}, { // The first arg is the collection ref
        ...storyInput,
        chapters: storyInput.chapters || [], // Ensure chapters is an array
      });
    });

    it("should call addDoc with provided chapters", async () => {
        const chapters: Chapter[] = [{ id: "c1", title: "Intro", content: "Hello", order: 1}];
        const storyInput: StoryInput = {
          title: "New Story With Chapters",
          chapters: chapters,
          description: "A new story with chapters",
          genre: "Fantasy",
          authorId: "author5",
          authorName: "Author Five",
          createdAt: new Date().toISOString(),
          status: "published",
        };
        mockAddDoc.mockResolvedValue({ id: "newStoryWithChaptersId" });
        mockCollection.mockReturnValue({});
  
        const newStoryId = await createStory(storyInput);
  
        expect(newStoryId).toBe("newStoryWithChaptersId");
        expect(mockAddDoc).toHaveBeenCalledWith({}, {
          ...storyInput,
          chapters: chapters,
        });
      });
  });

  // --- updateStory Tests ---
  describe("updateStory", () => {
    it("should call updateDoc to replace chapters array when provided", async () => {
      const storyUpdate: StoryUpdate = {
        chapters: [{ id: "chapUpdated", title: "Updated Chapter 1", content: "Updated Content", order: 1 }],
        updatedAt: new Date().toISOString(),
      };
      mockUpdateDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue({}); // mock doc reference

      await updateStory("storyToUpdate1", storyUpdate);

      expect(mockDoc).toHaveBeenCalledWith(mockDb, "stories", "storyToUpdate1");
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, storyUpdate);
    });

    it("should call updateDoc to update other fields like title, along with chapters", async () => {
      const storyUpdate: StoryUpdate = {
        title: "Updated Story Title",
        chapters: [{ id: "chapNew", title: "New Chapter 1", content: "New Content", order: 1 }],
        description: "Updated description",
        updatedAt: new Date().toISOString(),
      };
      mockUpdateDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue({});

      await updateStory("storyToUpdate2", storyUpdate);

      expect(mockDoc).toHaveBeenCalledWith(mockDb, "stories", "storyToUpdate2");
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, storyUpdate);
    });

     it("should call updateDoc to update only non-chapter fields if chapters are not provided", async () => {
        const storyUpdate: StoryUpdate = {
          title: "Only Title Updated",
          description: "Only description updated",
          updatedAt: new Date().toISOString(),
        };
        mockUpdateDoc.mockResolvedValue(undefined);
        mockDoc.mockReturnValue({});
  
        await updateStory("storyToUpdate3", storyUpdate);
  
        expect(mockDoc).toHaveBeenCalledWith(mockDb, "stories", "storyToUpdate3");
        expect(mockUpdateDoc).toHaveBeenCalledWith({}, storyUpdate); // updateData should not contain chapters
      });
  });
  
  // --- getStories Tests (Bonus) ---
  describe("getStories", () => {
    it("should return stories, converting old format content to chapters", async () => {
      const mockStoriesData = [
        { 
          id: "s1", 
          data: () => ({ 
            title: "Story One", 
            chapters: [{ id: "c1", title: "Chap 1", content: "Content1", order: 1 }],
            createdAt: "2023-01-01",
            // ... other fields
          }) 
        },
        { 
          id: "s2", 
          data: () => ({ 
            title: "Story Two (Old)", 
            content: "Old content for story two", // Old format
            createdAt: "2023-01-02",
            // ... other fields
          }) 
        },
        { 
          id: "s3", 
          data: () => ({ 
            title: "Story Three (Empty)",
            createdAt: "2023-01-03",
             // No chapters, no content
            // ... other fields
          }) 
        },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockStoriesData,
        forEach: function(callback) { this.docs.forEach(callback); } // Basic forEach mock
      });
      mockQuery.mockReturnValue({}); // mock query reference
      mockCollection.mockReturnValue({}); // mock collection reference
      mockOrderBy.mockReturnValue({});
      mockLimit.mockReturnValue({});

      const stories = await getStories();

      expect(stories.length).toBe(3);
      expect(stories[0].title).toBe("Story One");
      expect(stories[0].chapters).toEqual([{ id: "c1", title: "Chap 1", content: "Content1", order: 1 }]);
      
      expect(stories[1].title).toBe("Story Two (Old)");
      expect(stories[1].chapters).toEqual([
        { id: "default", title: "Chapter 1", content: "Old content for story two", order: 1 },
      ]);
      expect(stories[1].content).toBeUndefined();

      expect(stories[2].title).toBe("Story Three (Empty)");
      expect(stories[2].chapters).toEqual([]);
      expect(stories[2].content).toBeUndefined();

      expect(mockCollection).toHaveBeenCalledWith(mockDb, "stories");
      // expect(mockQuery).toHaveBeenCalled(); // Further checks can be added for query parameters
    });
  });
});

// Helper to define jest if not present (for environments where jest is not globally available)
if (typeof jest === 'undefined') {
  global.jest = {
    fn: () => {
      const mockFn = (...args) => {
        mockFn.mock.calls.push(args);
      };
      mockFn.mock = { calls: [] };
      mockFn.mockClear = () => { mockFn.mock.calls = []; };
      mockFn.mockReset = () => { mockFn.mock.calls = []; }; // Simplified reset
      mockFn.mockResolvedValue = () => {}; // Simplified
      return mockFn;
    },
    mock: (moduleName, factory) => {
      // Simplified module mocking
    },
    requireActual: (moduleName) => require(moduleName), // For actual imports if needed
    // Add other jest object properties if needed by the code under test
  };
}

// Required for the @ts-nocheck to work with jest.fn if not globally defined
global.jest = global.jest || jest;

// This is a basic setup. A real Jest environment would handle this more robustly.
// The `jest.mock` calls should ideally be at the top level of the file.
// The above structure assumes jest.fn() and jest.mock() are available.
// If running this code directly without Jest, these mocks would need to be manually managed.
