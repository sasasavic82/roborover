import gql from "graphql-tag";

const GLOABL_SEARCH_QUERY = gql`
  query($term: String!, $organisation: ID!) {
    globalSearch(term: $term, organisation: $organisation) {
      type
      title
      description
      tags
      href
      icon
      colour
    }
  }
`;

export {
    GLOABL_SEARCH_QUERY
}