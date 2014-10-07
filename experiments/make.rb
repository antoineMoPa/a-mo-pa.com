require 'fileutils'

#
# Templater:
# Replaces value wrapped like that in strings {{myParam}}
#
class Templater
  attr_accessor :params
  attr_accessor :filters
  def initialize
    @@recursivity = 3
    @params = {
      urlPrefix: ""
    }
    @filters = []
    
    loadFilters()
  end
  
  
  def loadFilters
    Dir.glob("filters/*.rb").each do |filterPath|
      name = /filters\/(.*).rb/.match(filterPath)[1]
      load filterPath
      filter = Object.const_get(name.capitalize).new
      @filters.push(filter)
    end
  end
  def runFilters(string)
    @filters.each do |filter|
      string = filter.run(string)
    end
    return string
  end
  def fill(template,params = {})
    params = @params.merge(params)
    for i in 0..@@recursivity
      # Replace parameters
      params.each do |name,value|
        template.sub!("{{#{name}}}",value)
      end
    end
    
    return template
  end
end

def build
  contentTemplate = File.open("content.tpl.html","r").read()
  
  templater = Templater.new
  templater.params[:header] = 
    File.open("header.tpl.html","r").read()
  templater.params[:footer] = 
    File.open("footer.tpl.html","r").read()
  
  time = Time.new
  
  templater.params["generation-date"] = 
    time.strftime("%Y-%m-%d %H:%M:%S")
  
  File.open('index.tpl.html','r') do |indexTemplate|
    File.open('index.html','w') do |indexFile|
      filesList = "";
      filesListHtml = "";
      Dir.glob('{./content/*.content,./content/*/*.content}') do |file|
        if (/(.*).content$/.match (file))
          name = file.sub(/^.\/content/,"")
          name.gsub!(/^\//,"")
          
          htmlContent = File.open("content/#{name}","r").read();
          
          urlPrefix = "../"
          slashes = name.scan(/\//)
          
          if !slashes.nil?
            slashes.size.times {
              urlPrefix += "../"              
            }
          end
          
          contentName =  name.gsub(/\.content/,"")

          params = {
            urlPrefix: urlPrefix,
            content: templater.runFilters(htmlContent),
            title: name,
            contentName: contentName
          }
          
          htmlContent = templater.fill(contentTemplate.clone,params)
          
          htmlName = "html/" + name + ".html"
          
          dirname = File.dirname(htmlName)
          FileUtils.mkdir_p(dirname)
          
          File.open(htmlName,'w').write(htmlContent)
          
          filesList += "\t" + name + "\n\n"
          filesListHtml += "<a class='btn' href='#{htmlName}'>#{contentName}</a><br>"
        end
      end
      
      index = indexTemplate.read()
      index = templater.fill(index,{files: filesListHtml})
      
      indexFile.write(index)
    end
  end
end

def removePreviousFiles
  `rm -r html/*`
end

removePreviousFiles()

build()
