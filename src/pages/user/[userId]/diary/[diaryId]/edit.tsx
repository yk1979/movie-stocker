import { GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import EditForm from "../../../../../components/EditForm";
import Heading from "../../../../../components/Heading";
import Layout from "../../../../../components/Layout";
import { specterRead } from "../../../../../lib/client";
import {
  ShowDiaryServiceBody,
  ShowDiaryServiceQuery,
} from "../../../../../server/services/diaries/ShowDiaryService";
import { Diary } from "../../../../../server/services/diaries/types";
import { initializeStore } from "../../../../../store";
import { createDraft, getDiary } from "../../../../../store/diaries/reducers";
import { User, userSignIn } from "../../../../../store/user/reducers";
import { MyNextContext } from "../../../../../types/next";

const StyledLayout = styled(Layout)`
  > div {
    display: flex;
    flex-direction: column;
  }
`;

const StyledEditForm = styled(EditForm)`
  flex: 1;
  margin-top: 24px;
`;

type DiaryEditPageProps = {
  user: User;
  diary: Diary;
};

const DiaryEditPage: NextPage<DiaryEditPageProps> = ({ user, diary }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = (diary: Diary) => {
    dispatch(createDraft(diary));
    if (diary.body.length > 0) {
      router.push("/preview");
    }
  };

  return (
    <StyledLayout userId={user ? user.uid : null}>
      <Heading.Text1 text="てつどうを記録する" as="h2" />
      {user && (
        <StyledEditForm
          diary={diary}
          handleSubmit={(diary) => handleSubmit(diary)}
        />
      )}
    </StyledLayout>
  );
};

export const getServerSideProps = async ({
  req,
  res,
  query,
}: MyNextContext): Promise<GetServerSidePropsResult<DiaryEditPageProps>> => {
  const store = initializeStore();

  const { userId, diaryId } = query as { userId: string; diaryId: string };
  const token = req?.session?.decodedToken;

  if (!token) {
    res.redirect("/login");
    return Promise.reject();
  } else {
    store.dispatch(
      userSignIn({
        uid: token.uid,
        name: token.name,
        picture: token.picture,
      })
    );
    // TODO 色々微妙だけど応急処置 ログイン処理をappに寄せたい
    const { user } = store.getState() as { user: User };

    const firestore = req.firebaseServer.firestore();
    const params = {
      firestore,
      userId,
      diaryId,
    };
    store.dispatch(getDiary.started(params));
    const diary = await specterRead<
      Record<string, unknown>,
      ShowDiaryServiceQuery,
      ShowDiaryServiceBody
    >({
      serviceName: "show_diary",
      query: params,
    });
    store.dispatch(getDiary.done({ params, result: diary.body }));

    return {
      props: {
        user,
        diary: diary.body,
      },
    };
  }
};

export default DiaryEditPage;
