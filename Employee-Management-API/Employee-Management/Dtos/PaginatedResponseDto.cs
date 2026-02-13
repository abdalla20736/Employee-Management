using Employee_Management.Models;

namespace Employee_Management.Models;

public class PaginatedResponseDto<T>
{

    public int Total { get; set; }
    public int Page { get; set; }
    public bool IsNextPage { get; set; }
    public List<T> Data { get; set; }
}
