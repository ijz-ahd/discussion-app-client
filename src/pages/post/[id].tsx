import React from "react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { PostButtons } from "../../components/PostButtons";

const Post = ({}): any => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

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
    <Layout>
      <Flex align="center" justifyContent="space-between">
        <Box
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            paddingBottom: "15px",
            borderBottom: "1px solid lightgray",
          }}
        >
          <Flex align="center">
            <Box
              className="avatar"
              style={{
                backgroundColor: "#edf2f7",
                color: "gray",
                fontSize: "larger",
                borderRadius: "999px",
                fontWeight: 600,
                padding: "10px 20px",
                marginRight: "20px",
              }}
            >
              {data?.post?.creator.username.slice(0, 1).toUpperCase()}
            </Box>
            <Box>
              <Heading fontSize="medium" fontWeight="medium">
                {data?.post?.creator.username}
              </Heading>
              <p
                style={{
                  color: "gray",
                  marginTop: "4px",
                  fontSize: "10px",
                }}
              >
                {data?.post?.createdAt
                  ? new Date(parseInt(data?.post?.createdAt)).toDateString()
                  : null}
              </p>
            </Box>
          </Flex>
          <PostButtons id={data?.post?.id} creatorId={data?.post?.creator.id} />
        </Box>
      </Flex>
      <Box margin="2">
        <Heading fontSize="large" fontWeight="medium">
          {data?.post?.title}
        </Heading>

        <Text mt={4}>{data?.post?.text}</Text>
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
