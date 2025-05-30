import {
  createComment,
  getComments,
  setRating,
  getRating,
  getAverageRating,
  updateComment, // Added
  deleteComment, // Added
  // Story functions
  createStory,
  updateStory,
  getStory,
  getStories,
} from "./firestore";
import {
  addDoc,
  deleteDoc, // Added
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot,
  // For getDoc mock
  DocumentSnapshot, 
} from "firebase/firestore";
import type { CommentInput, RatingInput, StoryInput, StoryUpdate, Story } from "../types";

// Mock Date.now() for consistent timestamps
const FIXED_TIMESTAMP = 1678886400000; // March 15, 2023
jest.spyOn(Date, 'now').mockImplementation(() => FIXED_TIMESTAMP);

jest.mock("firebase/firestore", () => {
  const originalModule = jest.requireActual("firebase/firestore");
  return {
    ...originalModule,
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn((db, path) => ({ path })), // Return a mock collection ref object
    doc: jest.fn((db, collectionPath, id) => ({ path: `${collectionPath}/${id}` })), // Return a mock doc ref
    query: jest.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })), // Return a mock query
    where: jest.fn((fieldPath, opStr, value) => ({ type: 'where', fieldPath, opStr, value })),
    orderBy: jest.fn((fieldPath, directionStr) => ({ type: 'orderBy', fieldPath, directionStr })),
    limit: jest.fn((count) => ({ type: 'limit', count })),
    Timestamp: {
      now: jest.fn(() => ({
        // toMillis: jest.fn().mockReturnValue(Date.now()) - use FIXED_TIMESTAMP
        toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP)
      })),
    },
  };
});

// Helper to create mock QuerySnapshot
const createMockQuerySnapshot = (docsData: DocumentData[]): QuerySnapshot<DocumentData> => {
  const mockDocs = docsData.map((data, index) => ({
    id: `doc-${index}`,
    data: () => data,
    exists: () => true, // Assuming docs exist if they are in the snapshot
  })) as QueryDocumentSnapshot<DocumentData>[];

  return {
    empty: mockDocs.length === 0,
    docs: mockDocs,
    size: mockDocs.length,
    forEach: (callback) => mockDocs.forEach(callback),
    // Add other QuerySnapshot properties if needed by your functions
  } as QuerySnapshot<DocumentData>;
};

// Helper to create mock DocumentSnapshot
const createMockDocSnapshot = (data: DocumentData | null, id: string = "doc-id"): DocumentSnapshot<DocumentData> => {
  if (data === null) {
    return {
      id,
      exists: () => false,
      data: () => undefined, // When exists is false, data() returns undefined
    } as DocumentSnapshot<DocumentData>;
  }
  return {
    id,
    exists: () => true,
    data: () => data,
  } as DocumentSnapshot<DocumentData>;
};


describe("Comments Firestore Functions", () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockCollection = collection as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockOrderBy = orderBy as jest.Mock;
  const mockGetDoc = getDoc as jest.Mock; // Added for update/delete
  const mockUpdateDoc = updateDoc as jest.Mock; // Added for update
  const mockDeleteDocFunc = deleteDoc as jest.Mock; // Added for delete (renamed to avoid conflict if any)


  beforeEach(() => {
    // Reset mocks before each test
    mockAddDoc.mockClear();
    mockGetDocs.mockClear();
    mockCollection.mockClear();
    mockQuery.mockClear();
    mockWhere.mockClear();
    mockOrderBy.mockClear();
    mockGetDoc.mockClear(); // Added
    mockUpdateDoc.mockClear(); // Added
    mockDeleteDocFunc.mockClear(); // Added
    (Timestamp.now as jest.Mock).mockReturnValue({ toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP) });
  });

  describe("createComment", () => {
    it("should create a new comment with correct data and generated createdAt timestamp", async () => {
      mockAddDoc.mockResolvedValue({ id: "new-comment-id" });
      const commentInput: CommentInput = {
        storyId: "story1",
        userId: "user1",
        userName: "Test User",
        text: "This is a test comment",
        userAvatar: "avatar.png",
      };

      const commentId = await createComment(commentInput);

      expect(commentId).toBe("new-comment-id");
      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "comments");
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "comments" }), // Check if collection ref is for 'comments'
        expect.objectContaining({
          ...commentInput,
          createdAt: FIXED_TIMESTAMP.toString(),
        })
      );
    });
  });

  describe("getComments", () => {
    it("should retrieve comments for a given storyId, ordered by createdAt descending", async () => {
      const storyId = "story1";
      const mockCommentsData = [
        { storyId, userId: "user1", text: "Comment 1", createdAt: (FIXED_TIMESTAMP - 1000).toString(), userName: "User A" },
        { storyId, userId: "user2", text: "Comment 2", createdAt: FIXED_TIMESTAMP.toString(), userName: "User B" },
      ];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockCommentsData));

      const comments = await getComments(storyId);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "comments");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "comments" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: storyId }),
        expect.objectContaining({ type: 'orderBy', fieldPath: "createdAt", directionStr: "desc" })
      );
      expect(comments).toHaveLength(2);
      expect(comments[0]).toEqual(expect.objectContaining({ id: 'doc-0', ...mockCommentsData[0] }));
      expect(comments[1]).toEqual(expect.objectContaining({ id: 'doc-1', ...mockCommentsData[1] }));
    });

    it("should return an empty array if no comments exist for a storyId", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]));
      const comments = await getComments("non-existent-story-id");
      expect(comments).toEqual([]);
    });
  });

  describe('updateComment', () => {
    const mockCommentId = 'comment123';
    const mockUserId = 'user123'; // This is the logged-in user ID
    const mockOwnerUserId = 'user123'; // User who owns the comment
    const mockNonOwnerUserId = 'user456';
    const mockOriginalText = 'Original comment text';
    const mockNewText = 'Updated comment text';
    const mockTimestampString = FIXED_TIMESTAMP.toString();

    it('should update the comment text and updatedAt if the user is the owner', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: mockOwnerUserId, text: mockOriginalText, createdAt: 'some-past-time' }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateComment(mockCommentId, mockNewText, mockOwnerUserId);

      expect(mockGetDoc).toHaveBeenCalledWith(doc(undefined, "comments", mockCommentId)); // db is undefined in mock
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        doc(undefined, "comments", mockCommentId),
        { text: mockNewText, updatedAt: mockTimestampString }
      );
    });

    it('should throw an error if the comment is not found', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });
      await expect(updateComment(mockCommentId, mockNewText, mockUserId))
        .rejects.toThrow("Comment not found.");
    });

    it('should throw an error if the user is not the owner', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: mockOwnerUserId, text: mockOriginalText }), // Comment owned by mockOwnerUserId
      });
      // Attempting update by mockNonOwnerUserId
      await expect(updateComment(mockCommentId, mockNewText, mockNonOwnerUserId))
        .rejects.toThrow("You do not have permission to update this comment.");
    });
  });

  describe('deleteComment', () => {
    const mockCommentId = 'comment123';
    const mockOwnerUserId = 'user123';
    const mockNonOwnerUserId = 'user456';

    it('should delete the comment if the user is the owner', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: mockOwnerUserId }),
      });
      mockDeleteDocFunc.mockResolvedValue(undefined);

      await deleteComment(mockCommentId, mockOwnerUserId);

      expect(mockGetDoc).toHaveBeenCalledWith(doc(undefined, "comments", mockCommentId));
      expect(mockDeleteDocFunc).toHaveBeenCalledWith(doc(undefined, "comments", mockCommentId));
    });

    it('should not throw an error if the comment is already deleted (not found)', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });
      await expect(deleteComment(mockCommentId, mockOwnerUserId)).resolves.toBeUndefined();
      expect(mockDeleteDocFunc).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not the owner', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: mockOwnerUserId }), // Comment owned by mockOwnerUserId
      });
      // Attempting delete by mockNonOwnerUserId
      await expect(deleteComment(mockCommentId, mockNonOwnerUserId))
        .rejects.toThrow("You do not have permission to delete this comment.");
    });
  });
});

describe("Story Firestore Functions", () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockGetDoc = getDoc as jest.Mock;
  const mockUpdateDoc = updateDoc as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock; // For getStories
  const mockCollection = collection as jest.Mock;
  const mockDoc = doc as jest.Mock;
  const mockQuery = query as jest.Mock; // For getStories
  const mockOrderBy = orderBy as jest.Mock; // For getStories
  const mockLimit = limit as jest.Mock; // For getStories


  const storyId = "story123";
  const userId = "userABC";
  const authorName = "Author Test";
  const createdAt = FIXED_TIMESTAMP.toString();
  const updatedAt = (FIXED_TIMESTAMP + 1000).toString();


  beforeEach(() => {
    mockAddDoc.mockClear();
    mockGetDoc.mockClear();
    mockUpdateDoc.mockClear();
    mockGetDocs.mockClear();
    mockCollection.mockClear();
    mockDoc.mockClear();
    mockQuery.mockClear();
    mockOrderBy.mockClear();
    mockLimit.mockClear();
    (Timestamp.now as jest.Mock).mockReturnValue({ toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP) });
  });

  describe("createStory", () => {
    it("should create a new story with genres and tags", async () => {
      mockAddDoc.mockResolvedValue({ id: storyId });
      const storyInput: StoryInput = {
        title: "Test Story",
        description: "A story about tests.",
        genres: ["Fantasy", "Adventure"],
        tags: ["magic", "quest"],
        chapters: [{ id: "chap1", title: "Chapter 1", content: "Once upon a time...", order: 1 }],
        status: "draft",
        authorId: userId,
        authorName: authorName,
        createdAt: createdAt, // createdAt is usually set by the client in this app's pattern
      };

      const newStoryId = await createStory(storyInput);

      expect(newStoryId).toBe(storyId);
      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "stories");
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "stories" }),
        storyInput // The entire storyInput should be passed
      );
    });
  });

  describe("updateStory", () => {
    it("should update genres and tags of an existing story", async () => {
      const storyUpdate: StoryUpdate = {
        genres: ["Sci-Fi", "Cyberpunk"],
        tags: ["dystopian", "AI"],
        updatedAt: updatedAt,
      };
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateStory(storyId, storyUpdate);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "stories", storyId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `stories/${storyId}` }),
        storyUpdate
      );
    });

    it("should update only genres, leaving tags unchanged if not provided", async () => {
      const storyUpdate: StoryUpdate = {
        genres: ["Horror"],
        updatedAt: updatedAt,
      };
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateStory(storyId, storyUpdate);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `stories/${storyId}` }),
        storyUpdate // Firestore's updateDoc only updates provided fields
      );
    });
    
    it("should update only tags, leaving genres unchanged if not provided", async () => {
      const storyUpdate: StoryUpdate = {
        tags: ["newTag"],
        updatedAt: updatedAt,
      };
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateStory(storyId, storyUpdate);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `stories/${storyId}` }),
        storyUpdate
      );
    });

    it("should update genres to an empty array", async () => {
      const storyUpdate: StoryUpdate = {
        genres: [],
        updatedAt: updatedAt,
      };
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateStory(storyId, storyUpdate);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `stories/${storyId}` }),
        storyUpdate
      );
    });

    it("should update tags to an empty array", async () => {
        const storyUpdate: StoryUpdate = {
          tags: [],
          updatedAt: updatedAt,
        };
        mockUpdateDoc.mockResolvedValue(undefined);
        await updateStory(storyId, storyUpdate);
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.objectContaining({ path: `stories/${storyId}` }),
          storyUpdate
        );
      });
  });

  describe("getStory", () => {
    const baseStoryData = {
      title: "A Great Story",
      description: "Epic tale.",
      chapters: [{ id: "c1", title: "Ch1", content: "...", order: 1 }],
      authorId: userId,
      authorName: authorName,
      createdAt: createdAt,
      updatedAt: updatedAt,
      status: "published" as const,
    };

    it("should retrieve a story with populated genres and tags arrays", async () => {
      const modernStoryData = {
        ...baseStoryData,
        genres: ["Fantasy", "Magic"],
        tags: ["elves", "dragons"],
      };
      mockGetDoc.mockResolvedValue(createMockDocSnapshot(modernStoryData, storyId));
      const story = await getStory(storyId);
      expect(story).toEqual({ id: storyId, ...modernStoryData });
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "stories", storyId);
    });

    it("should handle backward compatibility for old 'genre' string field", async () => {
      const oldStoryData = {
        ...baseStoryData,
        genre: "OldGenre", // Old singular genre field
        // No genres or tags array
      };
      mockGetDoc.mockResolvedValue(createMockDocSnapshot(oldStoryData, storyId));
      const story = await getStory(storyId);
      expect(story).toEqual({
        id: storyId,
        ...baseStoryData,
        genre: "OldGenre", // The original field might still be there
        genres: ["OldGenre"], // Processed into an array
        tags: [], // Should default to empty array
      });
    });
    
    it("should default to empty arrays if genres and tags fields are missing (and no old 'genre')", async () => {
      const minimalStoryData = { ...baseStoryData }; // No genre, genres, or tags
      mockGetDoc.mockResolvedValue(createMockDocSnapshot(minimalStoryData, storyId));
      const story = await getStory(storyId);
      expect(story).toEqual({
        id: storyId,
        ...minimalStoryData,
        genres: [],
        tags: [],
      });
    });

    it("should return null if story does not exist", async () => {
      mockGetDoc.mockResolvedValue(createMockDocSnapshot(null, storyId));
      const story = await getStory(storyId);
      expect(story).toBeNull();
    });
  });

  describe("getStories", () => {
    const baseStoryData = (num: number) => ({
        title: `Story ${num}`,
        chapters: [{id: `c${num}`, title: `Ch ${num}`, content: "...", order: 1}],
        authorId: `user${num}`,
        authorName: `Author ${num}`,
        createdAt: (FIXED_TIMESTAMP - num * 1000).toString(),
        updatedAt: (FIXED_TIMESTAMP - num * 1000).toString(),
        status: "published" as const,
        description: `Description ${num}`,
      });

    it("should retrieve multiple stories and correctly process genres/tags", async () => {
      const storiesData = [
        { ...baseStoryData(1), genres: ["Modern", "Sci-Fi"], tags: ["future", "space"] }, // Modern
        { ...baseStoryData(2), genre: "OldGenreString" }, // Old genre field
        { ...baseStoryData(3) }, // Missing genres/tags
      ];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(storiesData));

      const stories = await getStories();

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "stories");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "stories" }),
        expect.objectContaining({ type: 'orderBy', fieldPath: "createdAt", directionStr: "desc" }),
        expect.objectContaining({ type: 'limit', count: 50 }) // Default limit
      );
      expect(stories).toHaveLength(3);
      
      // Story 1 (Modern)
      expect(stories[0]).toEqual(expect.objectContaining({
        id: 'doc-0',
        ...storiesData[0], 
      }));

      // Story 2 (Old genre field)
      expect(stories[1]).toEqual(expect.objectContaining({
        id: 'doc-1',
        title: storiesData[1].title,
        genre: "OldGenreString", // Original field might still be present
        genres: ["OldGenreString"],
        tags: [],
      }));

      // Story 3 (Missing fields)
      expect(stories[2]).toEqual(expect.objectContaining({
        id: 'doc-2',
        title: storiesData[2].title,
        genres: [],
        tags: [],
      }));

      // Spot check: ensure genres and tags are always arrays
      stories.forEach(story => {
        expect(Array.isArray(story.genres)).toBe(true);
        expect(Array.isArray(story.tags)).toBe(true);
      });
    });
  });
});

describe("Ratings Firestore Functions", () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockUpdateDoc = updateDoc as jest.Mock;
  const mockCollection = collection as jest.Mock;
  const mockDoc = doc as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockLimit = limit as jest.Mock;
  // mockGetDocs is already declared in the higher scope for "Ratings Firestore Functions"
  // const mockGetDocs = getDocs as jest.Mock; 

  beforeEach(() => {
    mockAddDoc.mockClear();
    mockGetDocs.mockClear(); // Ensure getDocs is cleared
    mockUpdateDoc.mockClear();
    mockCollection.mockClear();
    mockDoc.mockClear();
    mockQuery.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    (Timestamp.now as jest.Mock).mockReturnValue({ toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP) });
  });

  describe("setRating", () => {
    const ratingInput: RatingInput = {
      storyId: "story1",
      userId: "user1",
      value: 5,
    };

    it("should create a new rating if one does not exist for the user and story", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([])); // No existing rating
      mockAddDoc.mockResolvedValue({ id: "new-rating-id" });

      await setRating(ratingInput);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "ratings");
      // First getDocs call for checking existence
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: ratingInput.storyId }),
        expect.objectContaining({ type: 'where', fieldPath: "userId", opStr: "==", value: ratingInput.userId }),
        expect.objectContaining({ type: 'limit', count: 1 })
      );
      // Then addDoc call
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({
          ...ratingInput,
          createdAt: FIXED_TIMESTAMP.toString(),
          updatedAt: FIXED_TIMESTAMP.toString(),
        })
      );
    });

    it("should update an existing rating if one exists for the user and story", async () => {
      const existingRatingId = "existing-rating-doc-id";
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([{ ...ratingInput, id: existingRatingId, createdAt: (FIXED_TIMESTAMP - 1000).toString() }]));
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Update the value
      const newRatingInput: RatingInput = { ...ratingInput, value: 4 };
      await setRating(newRatingInput);
      
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "ratings", existingRatingId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `ratings/${existingRatingId}` }),
        {
          value: newRatingInput.value,
          updatedAt: FIXED_TIMESTAMP.toString(),
        }
      );
    });
  });

  describe("getRating", () => {
    const storyId = "story1";
    const userId = "user1";

    it("should retrieve a specific rating for a user and story", async () => {
      const mockRatingData = { storyId, userId, value: 4, createdAt: FIXED_TIMESTAMP.toString() };
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([mockRatingData]));

      const rating = await getRating(storyId, userId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: storyId }),
        expect.objectContaining({ type: 'where', fieldPath: "userId", opStr: "==", value: userId }),
        expect.objectContaining({ type: 'limit', count: 1 })
      );
      expect(rating).toEqual(expect.objectContaining({id: 'doc-0', ...mockRatingData}));
    });

    it("should return null if no rating exists for the user and story", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]));
      const rating = await getRating(storyId, "non-existent-user");
      expect(rating).toBeNull();
    });
  });

  describe("getAverageRating", () => {
    const mockStoryId = 'story1';
    // getDocs is mocked at the top of the file, so we cast it here for usage
    const mockGetDocsFunc = getDocs as jest.Mock;

    beforeEach(() => {
      // Reset relevant mocks if not done in a broader beforeEach
      mockGetDocsFunc.mockReset(); 
    });

    it('should return average 0 and count 0 if there are no ratings', async () => {
      mockGetDocsFunc.mockResolvedValue({
        empty: true,
        size: 0,
        docs: [],
        // forEach: jest.fn(), // Add forEach if your createMockQuerySnapshot or actual usage needs it
      });

      const result = await getAverageRating(mockStoryId);
      expect(result).toEqual({ average: 0, count: 0 });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        where("storyId", "==", mockStoryId)
      );
    });

    it('should calculate the correct average and count for a single rating', async () => {
      mockGetDocsFunc.mockResolvedValue({
        empty: false,
        size: 1,
        docs: [
          { data: () => ({ value: 4, storyId: mockStoryId, userId: 'user1' }) },
        ],
        // forEach: jest.fn(cb => [{ data: () => ({ value: 4 }) }].forEach(cb)),
      });

      const result = await getAverageRating(mockStoryId);
      expect(result).toEqual({ average: 4, count: 1 });
    });

    it('should calculate the correct average and count for multiple ratings', async () => {
      mockGetDocsFunc.mockResolvedValue({
        empty: false,
        size: 3,
        docs: [
          { data: () => ({ value: 3, storyId: mockStoryId, userId: 'user1' }) },
          { data: () => ({ value: 4, storyId: mockStoryId, userId: 'user2' }) },
          { data: () => ({ value: 5, storyId: mockStoryId, userId: 'user3' }) },
        ],
        // forEach: jest.fn(cb => [
        //   { data: () => ({ value: 3 }) },
        //   { data: () => ({ value: 4 }) },
        //   { data: () => ({ value: 5 }) },
        // ].forEach(cb)),
      });

      const result = await getAverageRating(mockStoryId);
      expect(result).toEqual({ average: 4, count: 3 }); // (3+4+5)/3 = 4
    });

    it('should handle rating documents with non-numeric values gracefully', async () => {
      mockGetDocsFunc.mockResolvedValue({
          empty: false,
          size: 2, 
          docs: [
              { id: 'rating1', data: () => ({ value: 5 }) },
              { id: 'rating2', data: () => ({ value: 'not-a-number' }) } 
          ],
          // forEach: jest.fn(cb => [
          //   { id: 'rating1', data: () => ({ value: 5 }) },
          //   { id: 'rating2', data: () => ({ value: 'not-a-number' }) }
          // ].forEach(cb)),
      });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getAverageRating(mockStoryId);
      
      expect(result).toEqual({ average: 2.5, count: 2 }); 
      expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[firestore.ts] Invalid rating value found for story story1, comment doc ID rating2:', 'not-a-number'
      );
      consoleWarnSpy.mockRestore();
    });
    
    it('should return average 0 and count 0 on Firestore error', async () => {
      mockGetDocsFunc.mockRejectedValue(new Error("Firestore query failed"));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getAverageRating(mockStoryId);
      expect(result).toEqual({ average: 0, count: 0 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[firestore.ts] Error getting average rating stats for story story1:', 
          expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
