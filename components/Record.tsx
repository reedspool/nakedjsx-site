import type { Database } from "server/src/supabaseGeneratedTypes";

type WeightRecords = Array<
  Database["public"]["Tables"]["fitness_record_weight"]["Row"]
>;

export const Components = {
  "cpnt-body-weight-history": ({ records }: { records: WeightRecords }) => (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Kilograms</th>
        </tr>
      </thead>
      <tbody>
        {records.map(({ created_at, kilograms }) => {
          return (
            <tr>
              <td>{created_at}</td>
              <td>{kilograms}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
} as const;
