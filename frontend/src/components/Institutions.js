import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@aws-amplify/ui-react';
import Institution from './Institution';

export default function Institutions({ institutions = [], onDelete }) {
  const handleDelete = (institutionId) => {
    // Confirm deletion with the user
    if (window.confirm("Are you sure you want to delete this institution?")) {
      onDelete(institutionId);
    }
  };

  return (
    <Table highlightOnHover={true} variation="striped">
      <TableHead>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {institutions.length ? (
          institutions.map((institution) => (
            <TableRow key={institution.institution_id}>
              <Institution institution={institution} />
              <TableCell>
                <Button onClick={() => handleDelete(institution.institution_id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan="2">No institutions found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
