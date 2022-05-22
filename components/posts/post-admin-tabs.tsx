import { Dispatch, SetStateAction } from 'react';

export const PostAdminTabs = (props: {
  showEditForm: boolean;
  setShowEditForm: Dispatch<SetStateAction<boolean>>;
  showPreviewForm: boolean;
  setShowPreviewForm: Dispatch<SetStateAction<boolean>>;
  showSummaryForm: boolean;
  setShowSummaryForm: Dispatch<SetStateAction<boolean>>;
  showImageForm: boolean;
  setShowImageForm: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    showEditForm,
    setShowEditForm,
    showPreviewForm,
    setShowPreviewForm,
    showSummaryForm,
    setShowSummaryForm,
    showImageForm,
    setShowImageForm,
  } = props;

  return (
    <div className="flex flex-col items-center justify-center px-10 overflow-x-hidden">
      <ul className="text-sm font-medium text-center text-gray-500 rounded-lg divide-x shadow flex divide-gray-700 dark:text-gray-400 lg:w-[800px] md:w-[600px]">
        <li className="w-full">
          <button
            onClick={() => {
              setShowEditForm(true);
              setShowPreviewForm(false);
              setShowSummaryForm(false);
              setShowImageForm(false);
            }}
            className={`${
              showEditForm ? 'bg-gray-700' : 'bg-gray-900'
            } inline-block p-4 w-full hover:text-white hover:bg-gray-700`}
          >
            Edit
          </button>
        </li>
        <li className="w-full">
          <button
            onClick={() => {
              setShowEditForm(false);
              setShowPreviewForm(true);
              setShowSummaryForm(false);
              setShowImageForm(false);
            }}
            className={`${
              showPreviewForm ? 'bg-gray-700' : 'bg-gray-900'
            } inline-block p-4 w-full hover:text-white hover:bg-gray-700`}
          >
            Preview
          </button>
        </li>
        <li className="w-full">
          <button
            onClick={() => {
              setShowEditForm(false);
              setShowPreviewForm(false);
              setShowSummaryForm(true);
              setShowImageForm(false);
            }}
            className={`${
              showSummaryForm ? 'bg-gray-700' : 'bg-gray-900'
            } inline-block p-4 w-full hover:text-white hover:bg-gray-700`}
          >
            Summary
          </button>
        </li>
        <li className="w-full">
          <button
            onClick={() => {
              setShowEditForm(false);
              setShowPreviewForm(false);
              setShowSummaryForm(false);
              setShowImageForm(true);
            }}
            className={`${
              showImageForm ? 'bg-gray-700' : 'bg-gray-900'
            } inline-block p-4 w-full hover:text-white hover:bg-gray-700`}
          >
            Upload
          </button>
        </li>
      </ul>
    </div>
  );
};
