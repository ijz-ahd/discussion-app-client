import React from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  console.log("data: ", data);

  let body;
  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Box ml={"auto"}>
        <NextLink href="/login">
          <Link color="black" fontWeight="medium" mr={4}>
            login
          </Link>
        </NextLink>

        <NextLink href="/register">
          <Link color="black" fontWeight="medium">
            register
          </Link>
        </NextLink>
      </Box>
    );
  } else {
    body = (
      <Flex ml={"auto"} alignItems="center">
        <Box mr={4} color="black" fontWeight="medium">
          {data.me.username}
        </Box>
        <Button
          size="sm"
          backgroundColor="whiteAlpha.500"
          color="black"
          fontWeight="medium"
          _hover={{ backgroundColor: "whiteAlpha.800", color: "black" }}
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex p={4} bg="tan" alignItems="center">
      <NextLink href="/">
        <Link color="black" fontWeight="extrabold">
          Forum
        </Link>
      </NextLink>
      {body}
    </Flex>
  );
};
