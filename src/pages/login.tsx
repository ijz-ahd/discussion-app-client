import React from "react";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useLoginMutation } from "../generated/graphql";
import { errorMap } from "../utils/errorMap";
import { useRouter as router } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Login: React.FC<{}> = ({}) => {
  const route = router();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(errorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            route.push("/");
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="Your username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                type="password"
                name="password"
                placeholder="Your password"
                label="Password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link marginLeft="auto" fontSize="sm" fontWeight="thin">
                  Forgot password?
                </Link>
              </NextLink>
            </Flex>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              color="white"
              isLoading={isSubmitting}
            >
              login
            </Button>
            <Box mt={3}>
              <NextLink href="/register">
                <Link color="teal.500" fontSize="sm" fontWeight="thin">
                  Sign up, In case you don't have one ?
                </Link>
              </NextLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
