import React from "react";
import { useSelector } from "react-redux";

import Layout from "../components/Layout";
import Preview from "../components/Preview";
import { RootState } from "../store";

const PreviewPage = () => {
  const diary = useSelector((state: RootState) => state.diary);
  return (
    <Layout>
      <Preview diary={diary} />
    </Layout>
  );
};

export default PreviewPage;
