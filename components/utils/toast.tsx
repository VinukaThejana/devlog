import { Toaster } from "react-hot-toast"

export const Toast = () => {
    return (
      <Toaster
        toastOptions={{
          className: '',
					style: {
						color: 'white',
						padding: '16px',
						border: '1px solid #1f2937',
						background: '#111827',
					},
          success: {
            style: {
              border: '1px solid #1f2937',
              background: '#111827',
            },
          },
          error: {
            style: {
              border: '1px solid #DA4167',
              background: '#1f2937',
            },
          },
        }}
      />
    )
}
