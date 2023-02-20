import gql from "graphql-tag";

const GETALLCASE = gql`
  mutation GetAllCase {
    getAllCase {
      id
      code
      active
      data
      parent_id
      m4case {
        id
        code
        active
        data
        parent_id
      }
      other_m4case {
        id
        code
        active
        data
        parent_id
      }
    }
  }
`;
const GETCASEBYID = gql`
  mutation GetCaseById($getCaseByIdId: Int!) {
    getCaseById(id: $getCaseByIdId) {
      id
      code
      active
      data
      parent_id
      m4case {
        id
        code
        active
        data
        parent_id
      }
      other_m4case {
        id
        code
        active
        data
        parent_id
      }
    }
  }
`;

const SAVECASEBYID = gql`
  mutation SaveCaseById(
    $saveCaseByIdId: Int!
    $code: String!
    $active: Int
    $data: JSON
    $parentId: Int
  ) {
    saveCaseById(
      id: $saveCaseByIdId
      code: $code
      active: $active
      data: $data
      parent_id: $parentId
    ) {
      id
    }
  }
`;

export default {
  GETALLCASE,
  GETCASEBYID,
  SAVECASEBYID,
};
