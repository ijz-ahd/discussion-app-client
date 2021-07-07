import React from "react";
import {
  NextComponentType,
  PartialNextContext,
  withUrqlClient,
} from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useRouter as router } from "next/router";
// import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { Box, Button } from "@chakra-ui/react";
import { Layout } from "../../../components/Layout";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";

const EditPost = () => {
  const route = router();
  const intId = useGetIntId();
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <Box>Loading post ...</Box>
      </Layout>
    );
  }

  if (error) {
    return error;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Sorry! Could not find post.</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({
            id: intId,
            ...values,
          });
          route.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text ..."
                label="Body"
              />
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting}>
              update
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(
  EditPost as NextComponentType<PartialNextContext, {}, {}>
);
