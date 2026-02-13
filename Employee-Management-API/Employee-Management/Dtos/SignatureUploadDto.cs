namespace Employee_Management.Models;

public class SignatureUploadDto
{
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public Stream Content { get; set; } = null!;
    public long Length { get; set; }
}
