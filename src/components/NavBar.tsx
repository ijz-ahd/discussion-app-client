import React from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter as router } from "next/router";

export const NavBar: React.FC<{}> = ({}) => {
  const route = router();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body;
  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Box ml={"auto"}>
        <NextLink href="/login">
          <Link color="white" fontWeight="medium" mr={4}>
            login
          </Link>
        </NextLink>

        <NextLink href="/register">
          <Button
            colorScheme="whiteAlpha"
            size="sm"
            color="white"
            fontWeight="medium"
          >
            register
          </Button>
        </NextLink>
      </Box>
    );
  } else {
    body = (
      <div
        style={{
          display: "flex",
          marginLeft: "auto",
          alignItems: "center",
        }}
      >
        <Box mr={4} color="white" fontWeight="medium">
          {data.me.username.charAt(0).toUpperCase() + data.me.username.slice(1)}
        </Box>
        <Button
          size="sm"
          backgroundColor="whiteAlpha.500"
          color="white"
          fontWeight="medium"
          _hover={{ backgroundColor: "whiteAlpha.800", color: "black" }}
          onClick={async () => {
            await logout();
            route.reload();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </div>
    );
  }
  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={1}
      p={4}
      bg="blue.900"
      alignItems="center"
    >
      <NextLink href="/">
        <Link color="white" fontWeight="extrabold">
          Discussion
        </Link>
      </NextLink>
      {body}
    </Flex>
  );
};
