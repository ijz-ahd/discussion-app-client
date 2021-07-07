import React from "react";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button, Link } from "@chakra-ui/react";
import { useRegisterMutation } from "../generated/graphql";
import { errorMap } from "../utils/errorMap";
import { useRouter as router } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const route = router();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          if (response.data?.register.errors) {
            setErrors(errorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            route.push("/");
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Your username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                type="email"
                name="email"
                placeholder="Your email"
                label="Email"
              />
            </Box>
            <Box mt={4}>
              <InputField
                type="password"
                name="password"
                placeholder="Your password"
                label="Password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              color="white"
              isLoading={isSubmitting}
            >
              register
            </Button>
            <Box mt={3}>
              <NextLink href="/login">
                <Link color="teal.500" fontSize="sm" fontWeight="thin">
                  Sign In, In case you have one ?
                </Link>
              </NextLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
