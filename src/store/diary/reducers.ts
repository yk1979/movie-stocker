import {
  CREATE_DRAFT,
  DELETE_DRAFT,
  DiaryActionTypes,
  DiaryState,
  GET_DIARY
} from "./types";

const diary = (state: DiaryState = null, action: DiaryActionTypes) => {
  switch (action.type) {
    case CREATE_DRAFT: {
      return {
        ...action.payload,
        id: action.payload.id || String(new Date().getTime()),
        title: action.payload.title || "タイトルなし"
      };
    }
    case DELETE_DRAFT:
      return null;
    case GET_DIARY:
      return { ...action.payload };
    default:
      return state;
  }
};

export default diary;
