import React from "react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostButtonsProps {
  id: number;
  creatorId: number;
}

export const PostButtons: React.FC<PostButtonsProps> = ({ id, creatorId }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Flex>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          icon={<EditIcon />}
          aria-label="Edit post"
          color="blackAlpha.600"
          size="sm"
          mr="8px"
        />
      </NextLink>
      {/* trash button  */}
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete post"
        color="red.400"
        size="sm"
        onClick={() => deletePost({ id })}
      />
    </Flex>
  );
};
