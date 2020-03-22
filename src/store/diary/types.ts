/**
 * state types
 */
export type Diary = {
  id: number;
  title: string;
  body: string;
};

export type DiaryState = Diary | null;

/**
 * action types
 */
export const CREATE_DRAFT = "CREATE_DRAFT";
export const ADD_DIARY = "ADD_DIARY";
export const TOGGLE_EDITING = "TOGGLE_EDITING";
export const DELETE_DIARY = "DELETE_DIARY";

interface CreateDraftAction {
  type: typeof CREATE_DRAFT;
  title: string;
  body: string;
}

interface DeleteDiaryAction {
  type: typeof DELETE_DIARY;
  id: number;
}

export type DiaryActionTypes = CreateDraftAction | DeleteDiaryAction;
