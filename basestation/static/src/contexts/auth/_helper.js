const changePasswordErrorMapper = (error) => {
  const errorMessage = error.message;

  if (errorMessage === 'Incorrect username or password.')
    return 'Incorrect current password';
  if (errorMessage.includes('previousPassword'))
    return 'Invalid current password.';

  return errorMessage;
};

export { changePasswordErrorMapper };
