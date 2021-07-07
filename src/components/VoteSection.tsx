import React from "react";
import { Flex, IconButton } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VoteSectionProps {
  post: PostSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  return (
    <Flex
      direction="column"
      alignItems="center"
      marginRight="8"
      marginLeft="2"
      color="gray"
    >
      <IconButton
        icon={<ChevronUpIcon />}
        fontSize="24px"
        cursor="pointer"
        marginBottom="5px"
        _hover={{
          boxShadow: "0px 0px 2px gray",
        }}
        borderRadius="full"
        aria-label="upvote"
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          await vote({
            postId: post.id,
            value: 1,
          });
        }}
      />
      <p style={{ color: "gray", fontWeight: 500 }}>{post.points}</p>
      <IconButton
        icon={<ChevronDownIcon />}
        fontSize="24px"
        cursor="pointer"
        marginTop="5px"
        _hover={{
          boxShadow: "0px 0px 2px gray",
        }}
        borderRadius="full"
        aria-label="upvote"
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          await vote({
            postId: post.id,
            value: -1,
          });
        }}
      />
    </Flex>
  );
};
