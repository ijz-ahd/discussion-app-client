import React, { useState } from "react";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import {
  Box,
  Flex,
  Heading,
  Button,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
import { VoteSection } from "../components/VoteSection";
import { Layout } from "../components/Layout";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { PostButtons } from "../components/PostButtons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });

  const [{ data: meData }] = useMeQuery();

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>Something went wrong, Reload this page.</div>;
  }

  return (
    <Layout>
      {meData?.me?.id ? (
        <Flex align="center">
          <Heading size="sm" fontWeight="medium">
            Write a post to start discussion,
          </Heading>
          <NextLink href="/create-post">
            <Button ml="auto">Create Post</Button>
          </NextLink>
        </Flex>
      ) : (
        <Flex align="center">
          <Heading size="sm" fontWeight="medium">
            Login to start writing post's ,
          </Heading>
        </Flex>
      )}
      <br />
      {!data && fetching ? (
        <div>Hang on, Loading your feed...</div>
      ) : (
        <>
          <Stack spacing={8}>
            {data?.posts?.posts.map((post) =>
              !post ? null : (
                <Flex
                  alignItems="center"
                  justifyContent="space-evenly"
                  key={post.id}
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                >
                  <VoteSection post={post} />
                  <Flex direction="column" width="full">
                    <Flex align="center" justifyContent="space-between">
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        {/* user info section   */}
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
                          {post.creator.username.slice(0, 1).toUpperCase()}
                        </Box>
                        <Box>
                          <Heading fontSize="medium" fontWeight="medium">
                            {post.creator.username}
                          </Heading>
                          <p
                            style={{
                              color: "gray",
                              marginTop: "4px",
                              fontSize: "10px",
                            }}
                          >
                            {new Date(parseInt(post.createdAt)).toDateString()}
                          </p>
                        </Box>
                      </Box>

                      <PostButtons id={post.id} creatorId={post.creator.id} />
                    </Flex>
                    {/* post detail section  */}
                    <Box margin="2">
                      <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                        <Link>
                          <Heading fontSize="large" fontWeight="medium">
                            {post.title}
                          </Heading>
                        </Link>
                      </NextLink>
                      <Text mt={4}>{post.textSnippet}</Text>
                    </Box>
                  </Flex>
                </Flex>
              )
            )}
          </Stack>

          {/* load more feature */}
          {data && data?.posts.hasMore ? (
            <Flex>
              <Button
                onClick={() => {
                  setVariables({
                    limit: variables.limit,
                    cursor:
                      data.posts.posts[data.posts.posts.length - 1].createdAt,
                  });
                }}
                isLoading={fetching}
                m="auto"
                my={8}
              >
                Load more
              </Button>
            </Flex>
          ) : (
            <br />
          )}
        </>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
