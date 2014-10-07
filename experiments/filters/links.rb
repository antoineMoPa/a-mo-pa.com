# Transforms urls into links
class Links
  def run(string)
    return urlsToLinks(string)
  end
  def urlsToLinks(string)
    string = string.gsub(/\[(http(s?)):\/\/([^ \]]*)\]/) do
      url = "#{$1}://#{$3}"
      "<a href='#{url}'>#{url}</a>"
    end
    string = string.gsub(/\[(http(s?)):\/\/([^ \]]*) ([^\]]*)\]/) do
      url = "#{$1}://#{$3}"
      "<a href='#{url}'>#{$4}</a>"
    end
  end
end
