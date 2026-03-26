import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Note Types
  public type NoteId = Nat;

  public type Note = {
    id : NoteId;
    owner : Principal;
    title : Text;
    filename : Text;
    mimeType : Text;
    uploadDate : Int;
    textContent : Text;
    summary : ?Text;
    externalBlob : Storage.ExternalBlob;
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  public type NoteMetadata = {
    id : NoteId;
    title : Text;
    filename : Text;
    mimeType : Text;
    uploadDate : Int;
    hasSummary : Bool;
  };

  module NoteMetadata {
    public func compare(note1 : NoteMetadata, note2 : NoteMetadata) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  public type SaveNoteRequest = {
    title : Text;
    filename : Text;
    mimeType : Text;
    textContent : Text;
    externalBlob : Storage.ExternalBlob;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let notes = Map.empty<NoteId, Note>();
  let userNotes = Map.empty<Principal, [NoteId]>();
  var nextNoteId : NoteId = 0;

  // Get user role
  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, user)
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Note Functions
  public shared ({ caller }) func saveNote(request : SaveNoteRequest) : async NoteId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save notes");
    };
    let noteId = nextNoteId;
    nextNoteId += 1;

    let note : Note = {
      id = noteId;
      owner = caller;
      title = request.title;
      filename = request.filename;
      mimeType = request.mimeType;
      uploadDate = Time.now();
      textContent = request.textContent;
      summary = null;
      externalBlob = request.externalBlob;
    };

    notes.add(noteId, note);

    // Add to user's note list
    let updatedNotes = switch (userNotes.get(caller)) {
      case (?existing) { existing.concat([noteId]) };
      case (null) { [noteId] };
    };

    userNotes.add(caller, updatedNotes);

    noteId;
  };

  public query ({ caller }) func listNotes() : async [NoteMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list notes");
    };

    let noteIds = switch (userNotes.get(caller)) {
      case (?ids) { ids };
      case (null) { [] };
    };

    noteIds.map(func(id) { toNoteMetadata(getNoteInternal(id)) }).sort();
  };

  public query ({ caller }) func getNote(noteId : NoteId) : async ?Note {
    let note = getNoteInternal(noteId);
    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Can only access your own notes");
    };
    ?note;
  };

  public shared ({ caller }) func summarizeNote(noteId : NoteId) : async Text {
    let note = getNoteInternal(noteId);

    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Can only summarize your own notes");
    };

    // Check if summary already exists
    switch (note.summary) {
      case (?existingSummary) { return existingSummary };
      case (null) {};
    };

    // Call AI API to generate summary
    let summary = await callAIForSummary(note.textContent);

    // Update note with summary
    let updatedNote : Note = {
      id = note.id;
      owner = note.owner;
      title = note.title;
      filename = note.filename;
      mimeType = note.mimeType;
      uploadDate = note.uploadDate;
      textContent = note.textContent;
      summary = ?summary;
      externalBlob = note.externalBlob;
    };
    notes.add(noteId, updatedNote);

    summary;
  };

  public shared ({ caller }) func askQuestion(noteId : NoteId, question : Text) : async Text {
    let note = getNoteInternal(noteId);

    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Can only ask questions about your own notes");
    };

    // Call AI API to answer question
    await callAIForQuestion(note.textContent, question);
  };

  public shared ({ caller }) func deleteNote(noteId : NoteId) : async () {
    let note = getNoteInternal(noteId);

    if (note.owner != caller) {
      Runtime.trap("Unauthorized: Can only delete your own notes");
    };

    // Remove from notes map
    notes.remove(noteId);

    // Remove from user's note list
    let currentNotes = switch (userNotes.get(caller)) {
      case (?existing) { existing };
      case (null) { [] };
    };
    let updatedNotes = currentNotes.filter(func(id) { id != noteId });
    userNotes.add(caller, updatedNotes);
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all notes");
    };
    notes.values().toArray().sort();
  };

  // Helper Functions
  private func toNoteMetadata(note : Note) : NoteMetadata {
    {
      id = note.id;
      title = note.title;
      filename = note.filename;
      mimeType = note.mimeType;
      uploadDate = note.uploadDate;
      hasSummary = switch (note.summary) {
        case (?_) { true };
        case (null) { false };
      };
    };
  };

  private func getNoteInternal(noteId : NoteId) : Note {
    switch (notes.get(noteId)) {
      case (?note) { note };
      case (null) { Runtime.trap("Note not found") };
    };
  };

  // AI API Helper Functions
  private func callAIForSummary(textContent : Text) : async Text {
    // TODO: Implement HTTP outcall to Google Gemini API
    // For now, return a placeholder
    "Summary: " # textContent;
  };

  private func callAIForQuestion(textContent : Text, question : Text) : async Text {
    // TODO: Implement HTTP outcall to Google Gemini API
    // For now, return a placeholder
    "Answer to '" # question # "' based on: " # textContent;
  };
};
