import React, { useState } from "react";
import { Box, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter as router } from "next/router";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { errorMap } from "../../utils/errorMap";
import { useChangePasswordMutation } from "../../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const ChangePassword: NextPage = () => {
  const [, changePassword] = useChangePasswordMutation();
  const route = router();
  const [tokenError, setTokenError] = useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: route.query.token === "string" ? route.query.token : "",
          });
          if (response.data?.changePassword.errors) {
            const error = errorMap(response.data.changePassword.errors);
            if ("token" in error) {
              setTokenError(error.token);
            }
            setErrors(error);
          } else if (response.data?.changePassword.user) {
            route.push("/");
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              type="password"
              name="newPassword"
              placeholder="Your new password"
              label="New password"
            />
            {tokenError && (
              <Box>
                <Box color="red.500" fontSize="sm" fontWeight="thin">
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link
                    color="teal.500"
                    textDecoration="underline"
                    fontSize="sm"
                    fontWeight="thin"
                  >
                    Request an another reset link
                  </Link>
                </NextLink>
              </Box>
            )}
            <Button mt={4} type="submit" isLoading={isSubmitting}>
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// ChangePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string,
//   };
// };

export default withUrqlClient(createUrqlClient)(ChangePassword);

// as FunctionComponent<PropsWithChildren<WithUrqlProps | { token: string }>>
