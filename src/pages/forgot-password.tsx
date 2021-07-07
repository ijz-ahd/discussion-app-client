import React, { useState } from "react";
import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return complete ? (
    <Box>If an account with this email exist, we've sent you an email.</Box>
  ) : (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="email" placeholder="Your email" label="Email" />
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              color="white"
              isLoading={isSubmitting}
            >
              forgot password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
