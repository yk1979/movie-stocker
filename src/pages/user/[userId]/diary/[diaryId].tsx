import { format, utcToZonedTime } from "date-fns-tz";
import fromUnixTime from "date-fns/fromUnixTime";
import parseISO from "date-fns/parseISO";
import { NextPage } from "next";
import { MyNextContext } from "next/dist/next-server/lib/utils";
import { useRouter } from "next/router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import firebase from "../../../../../firebase";
import DiaryViewer from "../../../../components/DiaryViewer";
import Layout from "../../../../components/Layout";
import UserProfile from "../../../../components/UserProfile";
import { RootState, wrapper } from "../../../../store";
import { createDraft, requestDiary } from "../../../../store/diary/actions";
import { Diary } from "../../../../store/diary/types";
import { userSignIn } from "../../../../store/user/actions";
import { User } from "../../../../store/user/types";

const StyledDiaryViewer = styled(DiaryViewer)`
  margin-top: 24px;
`;

type UserDiaryPageProps = {
  author: User;
  diary: Diary;
};

// TODO ブラウザバックでauthorのデータがうまく取れない問題を修正
const UserDiaryPage: NextPage<UserDiaryPageProps> = ({
  author,
  diary
}: UserDiaryPageProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  return (
    <Layout userId={user ? user.uid : null}>
      <UserProfile
        user={{
          uid: author.uid,
          name: author.name || "unknown"
        }}
        thumbnail={author.picture}
        info={{
          text: format(parseISO(diary.lastEdited), "yyyy-MM-dd HH:mm", {
            timeZone: "Asia/Tokyo"
          }),
          date: diary.lastEdited
        }}
      />
      <button
        type="button"
        onClick={() => {
          dispatch(
            requestDiary({
              fireStore: firebase.firestore(),
              userId: author.uid,
              diaryId: diary.id
            })
          );
        }}
      >
        saga test
      </button>
      <StyledDiaryViewer
        diary={diary}
        // TODO fix
        controller={
          user?.uid === author.uid
            ? {
                onEdit: () => {
                  dispatch(
                    createDraft({
                      id: diary.id,
                      title: diary.title,
                      body: diary.body,
                      lastEdited: ""
                    })
                  );
                  router.push("/edit");
                },
                onDelete: () => {}
              }
            : undefined
        }
      />
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  async ({ req, res, query, store }: MyNextContext) => {
    const userId = query.userId as string;
    const diaryId = query.diaryId as string;
    const token = req?.session?.decodedToken;
    let diary!: Diary;

    const author = {
      uid: userId,
      name: "",
      picture: ""
    };

    if (token) {
      store.dispatch(
        userSignIn({
          uid: token.uid,
          name: token.name,
          picture: token.picture
        })
      );

      try {
        await req?.firebaseServer
          .firestore()
          .collection(`users`)
          .doc(userId)
          .get()
          .then(doc => doc.data())
          .then(response => {
            author.name = response?.name;
            author.picture = response?.picture;
          });
        const diaryData = await req?.firebaseServer
          .firestore()
          .collection(`users/${userId}/diaries/`)
          .doc(diaryId)
          .get()
          .then(doc => {
            const data = doc.data();
            if (!data) return undefined;
            return {
              id: data.id,
              title: data.title,
              body: data.body,
              // eslint-disable-next-line no-underscore-dangle
              lastEdited: utcToZonedTime(
                fromUnixTime(data.lastEdited.seconds),
                "Asia/Tokyo"
              ).toISOString()
            };
          });

        if (!diaryData) {
          // TODO nextの404ページに飛ばしたい
          // eslint-disable-next-line
        res?.status(404).send("not found");
        } else {
          diary = diaryData;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }

    return {
      props: {
        author,
        diary
      }
    };
  }
);

export default UserDiaryPage;
