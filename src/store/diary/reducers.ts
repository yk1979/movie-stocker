import {
  CREATE_DRAFT,
  DELETE_DRAFT,
  DiaryActionTypes,
  DiaryState,
  GET_DIARIES,
  GET_DIARY
} from "./types";

// TODO 一緒に使うことは今のところないけど、下書きと後悔済みの日記が同じdiary stateで管理されているのは微妙な気が
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
    case GET_DIARIES:
      return [...action.payload];
    default:
      return state;
  }
};

export default diary;
