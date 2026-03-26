import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Note {
    id: NoteId;
    title: string;
    externalBlob: ExternalBlob;
    owner: Principal;
    mimeType: string;
    filename: string;
    summary?: string;
    uploadDate: bigint;
    textContent: string;
}
export type NoteId = bigint;
export interface NoteMetadata {
    id: NoteId;
    hasSummary: boolean;
    title: string;
    mimeType: string;
    filename: string;
    uploadDate: bigint;
}
export interface SaveNoteRequest {
    title: string;
    externalBlob: ExternalBlob;
    mimeType: string;
    filename: string;
    textContent: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    askQuestion(noteId: NoteId, question: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteNote(noteId: NoteId): Promise<void>;
    getAllNotes(): Promise<Array<Note>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNote(noteId: NoteId): Promise<Note | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    listNotes(): Promise<Array<NoteMetadata>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveNote(request: SaveNoteRequest): Promise<NoteId>;
    summarizeNote(noteId: NoteId): Promise<string>;
}
