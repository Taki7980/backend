export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      error: error.name,
      message: error.message
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      error: 'Internal Server Error',
      message: error.message
    };
  }

  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unknown error occurred'
  };
}; 